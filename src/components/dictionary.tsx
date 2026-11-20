"use client";

import { LineIcon } from "./line-icons";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { fold } from "@/lib/data/catalog";
import { findTerms, glossaryGroups, terms, type Term } from "@/lib/data/glossary";

const letters = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const pageSize = 24;
const initial = (term: Term) => /^[a-z]/.test(fold(term.label)) ? fold(term.label)[0].toUpperCase() : "#";

export function Dictionary({ query }: { query: string }) {
  const [text, setText] = useState(query);
  const [letter, setLetter] = useState("");
  const [group, setGroup] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const filtered = findTerms(text).filter((term) => !group || term.groupId === group);
  const available = new Set(filtered.map(initial));
  const list = filtered.filter((term) => !letter || letter === initial(term));
  function clear() { setText(""); setGroup(""); setLetter(""); setLimit(pageSize); }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); input.current?.focus(); input.current?.select(); } };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return <main id="conteudo" className="shell inner-page apple-home" tabIndex={-1}>
    <section className="scene-dark sub-hero dictionary-hero"><div>
      <p className="hero-kicker"><LineIcon name="book" size={15} /> GLOSSÁRIO LBEdu MAC</p><h1>Dicionário de <span>tecnologia.</span></h1>
      <p>De API a Webhook: termos do macOS, do desenvolvimento e da internet explicados sem complicação.</p>
      <form className="hero-search dictionary-search" role="search" aria-label="Buscar no dicionário" onSubmit={(event) => { event.preventDefault(); results.current?.focus(); }}>
        <button type="submit" className="search-icon-button" aria-label="Ver termos encontrados"><LineIcon name="search" size={21} strokeWidth={1.8} /></button><label className="sr-only" htmlFor="dictionary-search">Pesquisar no dicionário</label>
        <input id="dictionary-search" ref={input} value={text} maxLength={100} onChange={(event) => { setText(event.target.value); setLetter(""); setLimit(pageSize); }} placeholder="Ex.: API, Terminal, Apple Silicon…" autoComplete="off" />
        {text && <button type="button" className="search-clear" aria-label="Limpar pesquisa" onClick={() => { setText(""); setLimit(pageSize); input.current?.focus(); }}><LineIcon name="x" size={17}  /></button>}
      </form>
    </div><div className="dictionary-art" aria-hidden="true"><i /><span className="dict-art-back">Aa</span><span className="dict-art-book"><LineIcon name="book" size={68} strokeWidth={1.4} /></span><span className="dict-art-hash"><LineIcon name="plus" size={24} /></span></div></section>
    <section className="scene-light dictionary-list" aria-labelledby="dictionary-list-title">
      <div className="catalog-heading"><div><p className="eyebrow section-kicker"><span /> De A a Z</p><h2 id="dictionary-list-title">Explore os termos</h2><p>Busque pelo nome, por uma sigla ou pelo assunto.</p></div><label className="dictionary-select"><span className="sr-only">Filtrar por tema do dicionário</span><select value={group} onChange={(event) => { setGroup(event.target.value); setLetter(""); setLimit(pageSize); }}><option value="">Todos os temas</option>{glossaryGroups.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select><LineIcon name="chevrondown" size={16} aria-hidden="true" /></label></div>
      <div className="alphabet" aria-label="Filtrar por inicial"><button type="button" aria-pressed={!letter} onClick={() => { setLetter(""); setLimit(pageSize); }}>Todos</button>{letters.map((current) => <button type="button" disabled={!available.has(current)} aria-pressed={letter === current} key={current} aria-label={current === "#" ? "Termos iniciados com números" : `Letra ${current}`} onClick={() => { setLetter(current); setLimit(pageSize); }}>{current}</button>)}</div>
      <div className="result-bar" ref={results} tabIndex={-1}><span aria-live="polite"><strong>{list.length}</strong> {list.length === 1 ? "termo" : "termos"}{text.trim() ? ` para “${text.trim()}”` : ""}</span>{(text || letter || group) && <button type="button" className="plain-action" onClick={clear}>Limpar filtros <LineIcon name="x" size={14}  /></button>}</div>
      {list.length ? <div className="term-grid">{list.slice(0, limit).map((term) => <Link key={term.id} className="term-card" href={`/dicionario/${term.id}`}>
        <div><span>{term.group}</span><LineIcon name="arrowupright" size={17} /></div><h3>{term.label}</h3><p>{term.explanation}</p>
      </Link>)}</div> : <div className="empty-state"><span><LineIcon name="book" size={25} /></span><h3>Nenhum termo encontrado</h3><p>Tente uma sigla, outro assunto ou uma busca mais curta.</p><button type="button" className="secondary-button" onClick={clear}>Limpar busca e filtros</button></div>}
      {list.length > limit && <div className="load-more"><span>Mostrando {limit} de {list.length} termos</span><button type="button" className="secondary-button" onClick={() => setLimit(limit + pageSize)}>Mostrar mais <LineIcon name="arrowdown" size={16} /></button></div>}
    </section>
    <aside className="scene-dark dictionary-teaser"><span className="teaser-icon"><LineIcon name="book" size={25} /></span><div><h2>Aprenda na prática.</h2><p>Conheça as ferramentas e descubra onde cada termo aparece no seu Mac.</p></div><Link href="/#catalogo" className="secondary-button">Explorar catálogo <LineIcon name="arrowright" size={16} /></Link></aside>
  </main>;
}

export const termCount = terms.length;
