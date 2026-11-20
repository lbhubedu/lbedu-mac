import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedTools } from "@/db/schema";
import { toolsBySlug } from "@/lib/data/catalog";

export const visitorCookie = "lbedumac_id";
export const fallbackSavedCookie = "lbedumac_saved";
export const validVisitor = (id: string | undefined): id is string => Boolean(id && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id));

export function parseSavedCookie(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((s) => s.trim()).filter((slug) => Object.hasOwn(toolsBySlug, slug)))].slice(0, 60);
}

export async function getFavorites() {
  const jar = await cookies();
  if (!db) {
    return parseSavedCookie(jar.get(fallbackSavedCookie)?.value);
  }
  const id = jar.get(visitorCookie)?.value;
  if (!validVisitor(id)) return parseSavedCookie(jar.get(fallbackSavedCookie)?.value);
  try {
    const rows = await db.select({ slug: savedTools.slug }).from(savedTools).where(and(eq(savedTools.visitor, id), eq(savedTools.saved, true)));
    return rows.map(({ slug }) => slug).filter((slug) => Object.hasOwn(toolsBySlug, slug));
  } catch {
    return parseSavedCookie(jar.get(fallbackSavedCookie)?.value);
  }
}
