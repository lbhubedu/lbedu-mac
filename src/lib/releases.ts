import { eq } from "drizzle-orm";
import { db } from "@/db";
import { toolReleases } from "@/db/schema";
import { tools, type Release, type Tool } from "@/lib/data/catalog";
import snapshot from "@/lib/data/release-snapshot.json";

const originals: Record<string, Release | undefined> = snapshot;
const TTL = 24 * 60 * 60 * 1000;
const memoryReleases = new Map<string, { release: Release; checkedAt: number }>();

export async function catalogWithReleases(): Promise<Tool[]> {
  const rows = db ? await db.select().from(toolReleases).catch(() => []) : [];
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return tools.map((tool) => {
    const backup = originals[tool.slug];
    const mem = memoryReleases.get(tool.slug)?.release;
    const row = bySlug.get(tool.slug);
    const live = row?.source ? pickRelease(row, backup) : mem ? pickRelease(mem, backup) : backup;
    return live ? { ...tool, release: live } : tool;
  });
}

function pickRelease(release: Release, backup?: Release): Release {
  const chosen = backup?.published && (!release.published || release.published < backup.published) ? backup : release;
  return { version: chosen.version, published: chosen.published, url: chosen.url, source: chosen.source };
}

function validDay(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  const date = new Date(value);
  return date.getTime() <= Date.now() + 86_400_000 ? date.toISOString().slice(0, 10) : null;
}

async function fetchPublic(url: string, signal: AbortSignal, headers?: Record<string, string>) {
  const response = await fetch(url, { cache: "no-store", signal, headers, redirect: "error" });
  return response.ok ? response : null;
}

async function fromGitHub(tool: Tool, signal: AbortSignal): Promise<Release | null> {
  if (!tool.repo) return null;
  const channel = tool.slug === "bitwarden" ? "desktop-v" : tool.slug === "proton-vpn" ? "macos/" : null;
  const path = channel ? "releases?per_page=35" : "releases/latest";
  const response = await fetchPublic(`https://api.github.com/repos/${tool.repo}/${path}`, signal, {
    Accept: "application/vnd.github+json", "User-Agent": "LBEdu-Mac-Catalog", "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  });
  const payload = await response?.json();
  const data = channel ? (Array.isArray(payload) ? payload.find((entry) => !entry?.prerelease && !entry?.draft && typeof entry?.tag_name === "string" && entry.tag_name.toLowerCase().startsWith(channel)) : null) : payload;
  const version = typeof data?.tag_name === "string" ? data.tag_name.slice(0, 70) : null;
  if (!version) return null;
  return { version, published: validDay(data.published_at), url: `https://github.com/${tool.repo}/releases/tag/${encodeURIComponent(version)}`, source: "GitHub Releases" };
}

async function fromRaycast(signal: AbortSignal): Promise<Release | null> {
  const feed = await (await fetchPublic("https://www.raycast.com/changelog/feed.json", signal))?.json();
  if (!Array.isArray(feed?.items)) return null;
  const entry = feed.items.find((item: { url?: unknown }) => typeof item.url === "string" && /^https:\/\/www\.raycast\.com\/changelog\/macos\/[0-9-]+$/.test(item.url));
  if (!entry) return null;
  const version = entry.url.split("/").at(-1).replaceAll("-", ".");
  const page = await (await fetchPublic(entry.url, signal))?.text();
  const published = validDay(page?.match(/(?:published_time|datePublished)["']\s*(?:content=|:)\s*["']([^"']+)/i)?.[1] ?? page?.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d{2}/)?.[0]);
  return { version, published, url: entry.url, source: "Histórico oficial do Raycast" };
}

async function fromGitHubAtom(tool: Tool, signal: AbortSignal): Promise<Release | null> {
  if (!tool.repo) return null;
  const xml = await (await fetchPublic(`https://github.com/${tool.repo}/releases.atom`, signal))?.text();
  for (const item of xml?.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const published = validDay(item.match(/<updated>([^<]+)<\/updated>/)?.[1]);
    const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
    const url = item.match(/<link[^>]+href="([^"]+)"/)?.[1];
    const tag = `${title ?? ""} ${url ?? ""}`.toLowerCase();
    if (/\b(rc\d*|alpha|beta|nightly|prerelease)\b/.test(tag)) continue;
    if (published && title) return { version: title.replace(/&amp;/g, "&").trim().slice(0, 70), published, url: url ?? `https://github.com/${tool.repo}/releases`, source: "Histórico de versões do GitHub" };
  }
  return null;
}

async function fromIterm(signal: AbortSignal): Promise<Release | null> {
  const url = "https://iterm2.com/downloads.html";
  const page = await (await fetchPublic(url, signal))?.text();
  const pair = page?.match(/iTerm2-(\d+_\d+_\d+)\.zip[\s\S]{0,6000}?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d{2})/);
  return pair ? { version: pair[1].replaceAll("_", "."), published: validDay(pair[2]), url, source: "Histórico oficial do iTerm2" } : null;
}

async function fromBrew(tool: Tool, signal: AbortSignal): Promise<Release | null> {
  const source = tool.brew ? `cask/${tool.brew}` : tool.formula ? `formula/${tool.formula}` : null;
  if (!source) return null;
  const data = await (await fetchPublic(`https://formulae.brew.sh/api/${source}.json`, signal))?.json();
  const version = tool.brew ? data?.version : data?.versions?.stable;
  return typeof version === "string" && version !== "latest" ? { version: version.slice(0, 70), published: null, url: `https://formulae.brew.sh/${source}`, source: "Homebrew Formulae" } : null;
}

export async function releaseForTool(tool: Tool): Promise<Release | null> {
  const backup = originals[tool.slug];
  if (!tool.repo && !tool.brew && !tool.formula) return backup ?? null;
  const [row] = db ? await db.select().from(toolReleases).where(eq(toolReleases.slug, tool.slug)).limit(1).catch(() => []) : [];
  const mem = memoryReleases.get(tool.slug);
  const previous = row?.source ? pickRelease(row, backup) : mem ? pickRelease(mem.release, backup) : backup;
  if (row && Date.now() - row.checkedAt.getTime() < TTL) return previous ?? null;
  if (!db && mem && Date.now() - mem.checkedAt < TTL) return previous ?? null;
  let latest: Release | null = null;
  try {
    const signal = AbortSignal.timeout(4000);
    latest = tool.slug === "raycast" ? await fromRaycast(signal) : tool.slug === "iterm2" ? await fromIterm(signal) : await fromGitHub(tool, signal);
  } catch { /* Public feeds may be temporarily unavailable. */ }
  if (!latest && tool.repo) {
    try { latest = await fromGitHubAtom(tool, AbortSignal.timeout(2500)); } catch { /* The saved release stays available. */ }
  }
  if (!latest && (!previous || !previous.published)) {
    try { latest = await fromBrew(tool, AbortSignal.timeout(2500)); } catch { /* Preserve the last verified release. */ }
  }
  const release = latest ? pickRelease(latest, previous) : previous ?? null;
  if (release) memoryReleases.set(tool.slug, { release, checkedAt: Date.now() });
  if (db) {
    const values = { slug: tool.slug, version: release?.version ?? null, published: release?.published ?? null, url: release?.url ?? null, source: release?.source ?? null, checkedAt: new Date() };
    await db.insert(toolReleases).values(values).onConflictDoUpdate({ target: toolReleases.slug, set: values }).catch(() => undefined);
  }
  return release;
}
