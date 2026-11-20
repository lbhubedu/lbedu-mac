"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categoryLabels, riskLabels, shortDate, type Tool } from "@/lib/data/catalog";
import type { Term } from "@/lib/data/glossary";
import { useSaved } from "./site-shell";
import { LineIcon } from "./line-icons";

const marks: Record<string, string> = {
  activity: "M3 13h3l2-8 3 14 3-10 2 4h5", archive: "M4 5h16v4H4z M6 9v10h12V9 M10 13h4",
  audio: "M3 12h3l3-7v14l-3-7 M14 9c2-2 5-2 6 0 M15 12c1.5-1.2 3.3-1.2 4.5 0",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z", boxes: "M4 7h7v7H4z M13 7h7v7h-7z M7 17h10",
  braces: "M9 4c-3 0-3 2-3 4s-1 4-3 4c2 0 3 2 3 4s0 4 3 4 M15 4c3 0 3 2 3 4s1 4 3 4c-2 0-3 2-3 4s0 4-3 4",
  branch: "M7 6v12 M7 9c0-2 2-3 5-3h4 M17 4v5 M7 15c0 2 2 3 5 3h4 M17 13v5",
  calendar: "M4 6h16v14H4z M4 10h16 M9 3v5 M15 3v5 M9 14h3", camera: "M4 8h11v9H4z M15 11l5-3v9l-5-3",
  clipboard: "M8 5h8v3H8z M6 7h3v13H6z M15 7h3v13h-3z M9 12h6 M9 16h4",
  code: "M9 7 4 12l5 5 M15 7l5 5-5 5 M13 4l-2 16",
  database: "M4 6c0-2 16-2 16 0s-16 2-16 0Z M4 6v12c0 2 16 2 16 0V6 M4 12c0 2 16 2 16 0",
  disc: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  film: "M3 5h18v14H3z M8 5v14 M16 5v14 M3 12h18",
  gem: "M5 9 8 4h8l3 5-7 11-7-11Z M5 9h14 M9 4l1 5 2 11 2-11 1-5",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  image: "M3 5h18v14H3z M6 15l4-5 3 4 2-3 3 4 M16 9h.01",
  keyboard: "M3 7h18v10H3z M6 10h.01 M10 10h.01 M14 10h.01 M18 10h.01 M7 14h10",
  lock: "M5 11h14v9H5z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2",
  monitor: "M3 5h18v11H3z M9 20h6 M12 16v4",
  notebook: "M6 4h13v16H6z M9 4v16 M4 7h4 M4 12h4 M4 17h4",
  palette: "M12 3a9 9 0 0 0 0 18h2v-3h2a3 3 0 0 0 3-3h-2a2 2 0 0 1-2-2h3V9h-4V7a4 4 0 0 0-4-4Z M8 9h.01 M6 13h.01 M9 17h.01",
  play: "M6 4v16l14-8L6 4Z", refresh: "M4 8h11l-3-3 M20 16H9l3 3 M17 8a7 7 0 0 1 2 4 M7 16a7 7 0 0 1-2-4",
  restore: "M4 11a8 8 0 1 1 3 6 M4 5v6h6 M12 8v5l4 2", send: "M4 12 20 4l-6 16-3-6-7-2Z M11 14l9-10",
  shield: "M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z M9 12l2 2 4-4",
  sparkles: "M12 3v18 M3 12h18 M6 6l12 12 M18 6 6 18", terminal: "M4 5h16v14H4z M8 10l3 2-3 2 M13 15h4",
  trash: "M5 8h14 M9 8V5h6v3 M7 8l1 12h8l1-12 M10 12v4 M14 12v4",
  windows: "M3 5h8v7H3z M13 5h8v7h-8z M3 14h8v5H3z M13 14h8v5h-8z",
  wrench: "M14 4a5 5 0 0 0-6 7l-5 6 3 3 6-5a5 5 0 0 0 7-6l-3 3-3-1-1-3 2-4Z",
  zap: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
};

export function CategoryIcon({ icon, size = 15 }: { icon: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={marks[icon] ?? marks.grid} /></svg>;
}

export function ToolIcon({ tool, large = false }: { tool: Tool; large?: boolean }) {
  const brand = tool.icon === "raycast" ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.26 1.94 22 9.68l-1.94 1.94-7.74-7.74 1.94-1.94ZM9.7 6.5l7.74 7.74-1.94 1.94-3.9-3.9v3.62L6.16 10.45 9.7 6.5ZM2 15.7v3.26L5.04 22h3.21L2 15.7Zm0-3.72v1.59l8.41 8.41h1.62v-2.8L4.81 11.98H2Z"/></svg>
    : tool.icon === "rectangle" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.3"/><path d="M11.5 4.5v15m0-7.5h10"/><rect x="5.3" y="7.3" width="3.4" height="9.4" rx=".6" fill="currentColor" stroke="none"/></svg>
    : <CategoryIcon size={large ? 31 : 23} icon={tool.icon ?? "grid"} />;
  return <span className={`app-icon mark-${tool.tone ?? "slate"}${large ? " app-icon-large" : ""}`} aria-hidden="true">{brand}</span>;
}

export function RiskBadge({ risk }: { risk: Tool["risk"] }) {
  return <span className={`risk-badge risk-${risk}`}><span className="risk-mark" aria-hidden="true">{risk === "low" ? "I" : risk === "medium" ? "II" : "III"}</span>{riskLabels[risk]}</span>;
}

export function SaveButton({ tool }: { tool: Tool }) {
  const { saved, toggle } = useSaved();
  const active = saved.includes(tool.slug);
  return <button type="button" className="save-button" data-saved={active} aria-pressed={active} onClick={() => toggle(tool.slug)} aria-label={active ? `Remover ${tool.name} dos salvos` : `Salvar ${tool.name}`} title={active ? "Remover dos salvos" : "Salvar ferramenta"}><svg viewBox="0 0 20 20" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.4} aria-hidden="true"><path d="M5 3h10v14l-5-4-5 4V3Z"/></svg></button>;
}

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (slug: string) => void }) {
  return <article className="tool-card">
    <div className="tool-top"><ToolIcon tool={tool} /><div className="tool-top-label"><h3><button type="button" className="card-title" onClick={() => onOpen(tool.slug)}>{tool.name}</button></h3><span className="tool-category">{categoryLabels[tool.category]}</span></div><SaveButton tool={tool} /></div>
    <p>{tool.description}</p>
    <div className="tool-meta"><RiskBadge risk={tool.risk} /><span>{tool.release?.published ? <time dateTime={tool.release.published}>{shortDate(tool.release.published)}</time> : tool.price === "native" ? "Integrado ao macOS" : "Data não publicada"}</span></div>
    <div className="card-bottom" aria-hidden="true"><span>Ver detalhes</span><LineIcon name="arrowupright" size={15} /></div>
  </article>;
}

export function TermTag({ term }: { term: Term }) {
  const id = useId();
  const anchor = useRef<HTMLAnchorElement>(null);
  const hovering = useRef(false);
  const focused = useRef(false);
  const [position, setPosition] = useState<{ top: number; left: number; maxWidth: number; above: boolean } | null>(null);
  const show = useCallback(() => {
    if (!anchor.current) return;
    const bounds = anchor.current.getBoundingClientRect();
    const maxWidth = Math.min(224, window.innerWidth - 22);
    const above = bounds.top > 100;
    setPosition({ top: above ? bounds.top - 7 : bounds.bottom + 7, left: Math.max(11, Math.min(bounds.left, window.innerWidth - maxWidth - 11)), maxWidth, above });
  }, []);
  const visible = Boolean(position);
  useEffect(() => {
    if (!visible) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setPosition(null); };
    const hide = () => setPosition(null);
    window.addEventListener("scroll", hide, true); window.addEventListener("resize", hide); window.addEventListener("keydown", escape, true);
    return () => { window.removeEventListener("scroll", hide, true); window.removeEventListener("resize", hide); window.removeEventListener("keydown", escape, true); };
  }, [visible]);
  return <span className="term-tag-wrap"><Link ref={anchor} className="term-tag" aria-describedby={id} href={`/dicionario/${term.id}`}
    onPointerEnter={(event) => { if (event.pointerType !== "touch") { hovering.current = true; show(); } }}
    onPointerLeave={() => { hovering.current = false; if (!focused.current) setPosition(null); }}
    onFocus={() => { focused.current = true; show(); }} onBlur={() => { focused.current = false; if (!hovering.current) setPosition(null); }}>#{term.label.replace(/\s+(\S)/g, (_, letter: string) => letter.toLocaleUpperCase("pt-BR"))}</Link>
    <span className="sr-only" id={id}>{term.explanation}</span>
    {position && createPortal(<span className="term-tooltip" role="tooltip" aria-hidden="true" style={{ top: position.top, left: position.left, maxWidth: position.maxWidth, transform: position.above ? "translateY(-100%)" : undefined }}>{term.explanation}</span>, document.body)}
  </span>;
}
