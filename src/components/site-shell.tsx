"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const SavedContext = createContext<{ saved: string[]; toggle: (slug: string) => void }>({ saved: [], toggle: () => {} });
export const useSaved = () => useContext(SavedContext);
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Brand() {
  return <Link className="brand" href="/" aria-label="LBEdu Mac, início">
    <span className="brand-icon" aria-hidden="true"><svg viewBox="0 0 26 26" fill="none"><rect x="5" y="6" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M9 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M13 9v5M10.5 11.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span>
    <span>LBEdu<span className="brand-accent"> Mac</span></span>
  </Link>;
}

function Header({ dark, toggleTheme }: { dark: boolean; toggleTheme: () => void }) {
  const path = usePathname();
  const { saved } = useSaved();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    const frame = requestAnimationFrame(update);
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); };
  }, [path]);
  const anchor = ["#assistente", "#repositorios", "#configurador", "#catalogo", "#movimento"].includes(hash) ? hash : "";
  const isHome = path === "/" && !anchor;
  const isGuides = path.startsWith("/guias");
  const isDictionary = path.startsWith("/dicionario");
  return <header className="site-header"><div className="shell header-inner">
    <div onClick={() => setHash("")}><Brand /></div>
    <nav className="top-nav" aria-label="Navegação principal">
      <Link href="/" onClick={() => setHash("")} data-active={isHome} aria-current={isHome ? "page" : undefined}>Explorar</Link>
      <Link href="/guias" data-active={isGuides} aria-current={isGuides ? "page" : undefined}>Guias</Link>
      <Link href="/#assistente" onClick={() => setHash("#assistente")} data-active={anchor === "#assistente"} aria-current={anchor === "#assistente" ? "location" : undefined}>Assistente</Link>
      <Link href="/#repositorios" onClick={() => setHash("#repositorios")} data-active={anchor === "#repositorios"} aria-current={anchor === "#repositorios" ? "location" : undefined}>Repositórios</Link>
      <Link href="/#configurador" onClick={() => setHash("#configurador")} data-active={anchor === "#configurador"} aria-current={anchor === "#configurador" ? "location" : undefined}>Configurar</Link>
      <Link href="/dicionario" data-active={isDictionary} aria-current={isDictionary ? "page" : undefined}>Dicionário</Link>
    </nav>
    <div className="header-actions">
      <Link href="/?salvos=1#catalogo" onClick={() => setHash("#catalogo")} className="header-saved"><svg width="15" height="15" viewBox="0 0 20 20" {...line}><path d="M5 3h10v14l-5-4-5 4V3Z"/></svg><span>Salvos</span>{saved.length > 0 && <small>{saved.length}</small>}</Link>
      <button type="button" onClick={toggleTheme} className="theme-button" aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"} title={dark ? "Tema claro" : "Tema escuro"}>{dark
        ? <svg width="16" height="16" viewBox="0 0 20 20" {...line}><circle cx="10" cy="10" r="3.5"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4M5.7 14.3l-1.4 1.4"/></svg>
        : <svg width="16" height="16" viewBox="0 0 20 20" {...line}><path d="M16 13.3A7 7 0 0 1 6.7 4 7 7 0 1 0 16 13.3Z"/></svg>}</button>
    </div>
  </div></header>;
}

export function SiteShell({ children, initialSaved }: { children: ReactNode; initialSaved: string[] }) {
  const [saved, setSaved] = useState(initialSaved);
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState("");
  const savedRef = useRef(new Set(initialSaved));
  const pending = useRef(Promise.resolve());
  const versions = useRef(new Map<string, number>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { const isDark = localStorage.getItem("lbedumac_tema") === "dark"; document.documentElement.dataset.theme = isDark ? "dark" : "light"; setDark(isDark); } catch { /* Default to light. */ }
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(toastTimer.current); };
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("lbedumac_tema", next ? "dark" : "light"); } catch { /* Works for this visit. */ }
  }
  function toggle(slug: string) {
    const enabled = !savedRef.current.has(slug);
    const revision = (versions.current.get(slug) ?? 0) + 1;
    versions.current.set(slug, revision);
    if (enabled) savedRef.current.add(slug); else savedRef.current.delete(slug);
    setSaved([...savedRef.current]);
    pending.current = pending.current.then(async () => {
      try {
        const response = await fetch("/api/salvos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, saved: enabled }), signal: AbortSignal.timeout(7000) });
        if (!response.ok) throw new Error("save");
      } catch {
        if (versions.current.get(slug) === revision) {
          if (enabled) savedRef.current.delete(slug); else savedRef.current.add(slug);
          setSaved([...savedRef.current]);
          setNotice("Não foi possível atualizar os salvos. Tente novamente.");
          clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setNotice(""), 4500);
        }
      }
    });
  }
  return <SavedContext.Provider value={{ saved, toggle }}><div id="app-content">
    <a className="skip-link" href="#conteudo">Ir ao conteúdo</a>
    <Header dark={dark} toggleTheme={toggleTheme} />
    {children}
    <footer className="site-footer"><div className="shell footer-inner">
      <div><Brand /><p>Um guia independente para quem usa Mac.</p></div>
      <nav aria-label="Links do rodapé"><Link href="/#catalogo">Catálogo</Link><Link href="/guias">Guias</Link><Link href="/dicionario">Dicionário</Link><Link href="/metodologia#auditoria">Auditoria</Link><Link href="/metodologia#ranking">Como avaliamos</Link></nav>
    </div></footer>
  </div><div className="toast-region" role="status" aria-live="polite">{notice && <span>{notice}</span>}</div></SavedContext.Provider>;
}
