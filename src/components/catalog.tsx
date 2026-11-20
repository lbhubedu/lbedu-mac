"use client";

import { LineIcon } from "./line-icons";

import Link from "next/link";
import Image from "next/image";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { categories, findTools, type Category, type Release, type Tool } from "@/lib/data/catalog";
import { findTerms, terms } from "@/lib/data/glossary";
import { Configurator, GuidesBand, RepositoryRadar, TrustStrip, type ConfiguratorChoice } from "./apple-scenes";
import { Assistant } from "./assistant";
import { useSaved } from "./site-shell";
import { CategoryIcon, ToolCard, ToolIcon } from "./tool-ui";
import { ToolDrawer } from "./tool-drawer";

const PAGE_SIZE = 9;
type Filters = { price: string; risk: string; chip: string; open: boolean };
const noFilters: Filters = { price: "", risk: "", chip: "", open: false };

function FilterMenu({ filters, update }: { filters: Filters; update: (next: Filters) => void }) {
  const [visible, setVisible] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const count = Object.values(filters).filter(Boolean).length;
  useEffect(() => {
    if (!visible) return;
    const outside = (event: PointerEvent) => { if (!anchor.current?.contains(event.target as Node)) setVisible(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setVisible(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [visible]);
  return <div ref={anchor} className="filter-anchor">
    <button ref={trigger} type="button" onClick={() => setVisible(!visible)} className="secondary-button filter-button" aria-expanded={visible} aria-controls="catalog-filters" data-filtered={count > 0}><LineIcon name="sliders" size={17} strokeWidth={1.8} /> Filtros {count > 0 && <small>{count}</small>}</button>
    <AnimatePresence initial={false}>{visible && <motion.div id="catalog-filters" className="filter-panel" aria-label="Filtros avançados" initial={reduce ? false : { opacity: 0, scale: 0.97, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.97, y: -5 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 37 }}>
      <div className="filter-head"><strong>Refinar catálogo</strong><button onClick={() => update({ ...noFilters })} type="button">Limpar</button></div>
      <label>Preço<select value={filters.price} onChange={(event) => update({ ...filters, price: event.target.value })}><option value="">Qualquer preço</option><option value="free">Gratuito ou nativo</option><option value="freemium">Grátis com extras pagos</option><option value="paid">Pago</option></select></label>
      <label>Nível de risco<select value={filters.risk} onChange={(event) => update({ ...filters, risk: event.target.value })}><option value="">Qualquer risco</option><option value="low">Baixo risco</option><option value="medium">Risco moderado</option><option value="high">Atenção extra</option></select></label>
      <label>Compatibilidade<select value={filters.chip} onChange={(event) => update({ ...filters, chip: event.target.value })}><option value="">Qualquer chip</option><option value="silicon">Apple Silicon</option><option value="intel">Intel</option></select></label>
      <label className="check-label"><input type="checkbox" checked={filters.open} onChange={(event) => update({ ...filters, open: event.target.checked })} /> Somente código aberto</label>
      <button className="primary-button filter-done" type="button" onClick={() => { setVisible(false); trigger.current?.focus(); }}><LineIcon name="check" size={16} /> Concluir</button>
    </motion.div>}</AnimatePresence>
  </div>;
}

type Props = { initialTools: Tool[]; savedOnly: boolean; initialSlug: string; initialQuery: string };
export function Catalog({ initialTools, savedOnly, initialSlug, initialQuery }: Props) {
  const { saved } = useSaved();
  const [query, setQuery] = useState(initialQuery);
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState<Category | "all">("all");
  const [filters, setFilters] = useState<Filters>({ ...noFilters });
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [liveReleases, setLiveReleases] = useState<Record<string, Release>>({});
  const search = useRef<HTMLInputElement>(null);
  const searchWrap = useRef<HTMLDivElement>(null);
  const catalog = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const list = useMemo(() => initialTools.map((tool) => liveReleases[tool.slug] ? { ...tool, release: liveReleases[tool.slug] } : tool), [initialTools, liveReleases]);
  const queries = findTools(list, query);
  const eligible = queries.filter((tool) => (!savedOnly || saved.includes(tool.slug)) && (category === "all" || category === tool.category)
    && (!filters.risk || tool.risk === filters.risk) && (!filters.chip || tool.chips?.some((chip) => chip === filters.chip))
    && (!filters.price || tool.price === filters.price || filters.price === "free" && tool.price === "native") && (!filters.open || tool.open));
  if (sort === "name") eligible.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  else if (sort === "newest") eligible.sort((a, b) => (b.release?.published ?? "").localeCompare(a.release?.published ?? "") || a.name.localeCompare(b.name, "pt-BR"));
  else if (sort === "risk") eligible.sort((a, b) => ["low", "medium", "high"].indexOf(a.risk) - ["low", "medium", "high"].indexOf(b.risk));
  const active = list.find((tool) => tool.slug === activeSlug);
  const searchTerms = query.trim().length >= 2 ? findTerms(query).slice(0, 3) : [];
  const quickApps = queries.filter((tool) => !savedOnly || saved.includes(tool.slug)).slice(0, 3);
  const showSearch = searchOpen && query.trim().length >= 2;

  function moveToCatalog() {
    setSearchOpen(false);
    search.current?.blur();
    heading.current?.focus({ preventScroll: true });
    catalog.current?.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }
  function submitSearch(event: FormEvent) { event.preventDefault(); moveToCatalog(); }
  function updateQuery(value: string) { setQuery(value); setLimit(PAGE_SIZE); setSearchOpen(true); }
  const openTool = useCallback((slug: string) => { setSearchOpen(false); setActiveSlug(slug); }, []);
  const closeTool = useCallback(() => {
    setActiveSlug("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("ferramenta")) { url.searchParams.delete("ferramenta"); window.history.replaceState(null, "", url); }
    return;
  }, []);
  const updateRelease = useCallback((slug: string, release: Release) => setLiveReleases((releases) => ({ ...releases, [slug]: release })), []);
  const applyConfig = useCallback((choice: ConfiguratorChoice) => {
    setCategory(choice.category);
    setFilters({ price: choice.price, risk: choice.risk, chip: choice.chip, open: choice.open });
    setLimit(PAGE_SIZE);
    catalog.current?.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }, [reduce]);
  useEffect(() => {
    function keys(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !document.getElementById("app-content")?.inert) { event.preventDefault(); search.current?.focus(); search.current?.select(); }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  useEffect(() => {
    if (!showSearch) return;
    const outside = (event: PointerEvent) => { if (!searchWrap.current?.contains(event.target as Node)) setSearchOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [showSearch]);

  return <main className="shell home apple-home" id="conteudo" tabIndex={-1}>
    <section className="scene-dark home-hero hero-scene" aria-labelledby="hero-title">
      <div className="hero-material" aria-hidden="true" />
      <div className="hero-art" aria-hidden="true"><Image src="/images/hero-apple-dark.jpg" alt="" fill priority sizes="100vw" /></div>
      <div className="hero-copy">
        <span className="hero-kicker"><span className="lime-dot" /> LBEdu MAC · GUIA PARA MACOS</span>
        <h1 id="hero-title">O seu Mac,<br /><span>sem mistério.</span></h1>
        <p>Ferramentas, respostas e explicações simples. Descubra o que o seu Mac pode fazer.</p>
        <div className="hero-search-wrap" ref={searchWrap} onKeyDown={(event) => {
          if (event.key === "Escape") { search.current?.focus(); setSearchOpen(false); }
          if (event.key === "ArrowDown" && showSearch && event.target === search.current) { event.preventDefault(); searchWrap.current?.querySelector<HTMLElement>(".quick-search [data-result]")?.focus(); }
        }}>
          <form className="hero-search" role="search" aria-label="Busca no LBEdu Mac" onSubmit={submitSearch}>
            <button className="search-icon-button" type="submit" aria-label="Ver resultados da busca"><LineIcon name="search" size={21} strokeWidth={1.8} /></button>
            <label className="sr-only" htmlFor="catalog-search">Buscar ferramentas, categorias e termos</label>
            <input ref={search} id="catalog-search" autoComplete="off" placeholder="Buscar ferramentas, categorias, termos…" maxLength={120} value={query} onChange={(event) => updateQuery(event.target.value)} onFocus={() => setSearchOpen(true)} aria-controls={showSearch ? "resultados-rapidos" : undefined} />
            {query ? <button className="search-clear" type="button" onClick={() => { updateQuery(""); search.current?.focus(); }} aria-label="Limpar busca"><LineIcon name="x" size={17}  /></button> : <kbd aria-hidden="true"><LineIcon name="command" size={12} /> K</kbd>}
          </form>
          {showSearch && <div className="quick-search" id="resultados-rapidos" onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setSearchOpen(false); }}>
            {quickApps.length > 0 && <><p>Ferramentas</p>{quickApps.map((tool) => <button key={tool.slug} type="button" data-result onClick={() => openTool(tool.slug)}><ToolIcon tool={tool} /><span>{tool.name}</span><LineIcon name="arrowright" size={15} /></button>)}</>}
            {searchTerms.length > 0 && <><p>No dicionário</p>{searchTerms.map((term) => <Link key={term.id} data-result href={`/dicionario/${term.id}`}><LineIcon name="book" size={16} /><span>{term.label}</span><LineIcon name="arrowupright" size={15} /></Link>)}</>}
            {!quickApps.length && !searchTerms.length && <p className="quick-empty">Não encontramos resultados para esta busca.</p>}
            <button type="button" data-result className="quick-all" onClick={moveToCatalog}>Ver resultados no catálogo <LineIcon name="arrowdown" size={15} /></button>
          </div>}
        </div>
      </div>
    </section>
    <TrustStrip toolCount={list.length} termCount={terms.length} />
    <Assistant tools={list} onOpen={openTool} />
    <RepositoryRadar tools={list} onOpen={openTool} />
    <Configurator tools={list} onOpen={openTool} onApply={applyConfig} />
    <section className="scene-light catalog-section" id="catalogo" ref={catalog} aria-labelledby="catalog-title">
      <div className="catalog-heading"><div><p className="eyebrow section-kicker"><span /> {savedOnly ? "Sua coleção" : "Catálogo para macOS"}</p><h2 id="catalog-title" ref={heading} tabIndex={-1}>{savedOnly ? "Ferramentas salvas" : "Explore as ferramentas"}</h2><p>{savedOnly ? "Os apps que você guardou para encontrar depois." : "Apps e utilitários selecionados para tirar mais do seu Mac."}</p></div><FilterMenu filters={filters} update={(value) => { setFilters(value); setLimit(PAGE_SIZE); }} /></div>
      <div className="category-strip" aria-label="Categorias">
        <button type="button" className="category-tab" aria-pressed={category === "all"} onClick={() => { setCategory("all"); setLimit(PAGE_SIZE); }}><CategoryIcon icon="grid" /> Todas</button>
        {categories.map(({ id, label, icon }) => <button type="button" className="category-tab" aria-pressed={category === id} key={id} onClick={() => { setCategory(id); setLimit(PAGE_SIZE); }}><CategoryIcon icon={icon} /> {label}</button>)}
      </div>
      <div className="result-bar"><span aria-live="polite"><strong>{eligible.length}</strong> {eligible.length === 1 ? "ferramenta" : "ferramentas"}{query.trim() ? ` para “${query.trim()}”` : ""}{savedOnly && <Link href="/#catalogo">Ver todas <LineIcon name="arrowright" size={13} /></Link>}</span><label className="sort-wrap"><span className="sr-only">Ordenar ferramentas</span><select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(PAGE_SIZE); }}><option value="featured">Em destaque</option><option value="newest">Mais recentes</option><option value="name">Nome (A–Z)</option><option value="risk">Menor risco</option></select><LineIcon name="chevrondown" size={15} strokeWidth={1.9} aria-hidden="true" /></label></div>
      {eligible.length ? <div className="tool-grid">{eligible.slice(0, limit).map((tool) => <ToolCard key={tool.slug} tool={tool} onOpen={openTool} />)}</div> : <div className="empty-state"><span>{savedOnly && !saved.length ? <LineIcon name="bookmark" size={25} /> : <LineIcon name="search" size={25} />}</span><h3>{savedOnly && !saved.length ? "Nenhuma ferramenta salva" : "Nenhuma ferramenta encontrada"}</h3><p>{savedOnly && !saved.length ? "Use o ícone de marcador em qualquer ferramenta para guardá-la aqui." : "Tente outro termo ou remova alguns filtros."}</p>{savedOnly && !saved.length ? <Link className="secondary-button" href="/#catalogo">Explorar catálogo <LineIcon name="arrowright" size={15} /></Link> : <button type="button" className="secondary-button" onClick={() => { setQuery(""); setCategory("all"); setFilters({ ...noFilters }); setLimit(PAGE_SIZE); }}>Limpar busca e filtros</button>}</div>}
      {eligible.length > limit && <div className="load-more"><span>Mostrando {limit} de {eligible.length} ferramentas</span><button type="button" className="secondary-button" onClick={() => setLimit(limit + PAGE_SIZE)}>Mostrar mais <LineIcon name="arrowdown" size={16} /></button></div>}
    </section>
    <GuidesBand />
    <aside className="scene-light dictionary-teaser"><span className="teaser-icon"><LineIcon name="book" size={25} strokeWidth={1.8} /></span><div><p className="eyebrow"><span className="lime-dot" /> DICIONÁRIO LBEDU MAC</p><h2>Tecnologia, sem o tecniquês.</h2><p>{terms.length} termos explicados em português simples, de A a Z.</p></div><Link href="/dicionario" className="primary-button">Abrir dicionário <LineIcon name="arrowright" size={16} /></Link></aside>
    {active && <ToolDrawer key={active.slug} tool={active} onDismiss={closeTool} onRelease={updateRelease} />}
  </main>;
}
