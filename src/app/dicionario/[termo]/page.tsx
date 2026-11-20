import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LineIcon } from "@/components/line-icons";
import { technicalTags, termsById, type Term } from "@/lib/data/glossary";

const getTerm = (id: string) => Object.hasOwn(termsById, id) ? termsById[id] : undefined;
type Props = { params: Promise<{ termo: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = getTerm((await params).termo);
  return term ? { title: `O que é ${term.label}?`, description: term.explanation } : { title: "Termo não encontrado" };
}

export default async function TermPage({ params }: Props) {
  const term = getTerm((await params).termo);
  if (!term) notFound();
  const links = new Map<string, Term>();
  for (const id of term.related) { const related = getTerm(id); if (related && related.id !== term.id) links.set(related.id, related); }
  for (const related of technicalTags(`${term.explanation} ${term.example ?? ""}`)) if (related.id !== term.id) links.set(related.id, related);
  return <main id="conteudo" tabIndex={-1} className="shell inner-page term-page apple-home">
    <Link className="back-link" href="/dicionario"><LineIcon name="arrowleft" size={17} /> Voltar ao dicionário</Link>
    <article><header className="scene-dark sub-hero term-hero"><div><p className="hero-kicker"><LineIcon name="hash" size={15} /> {term.group}</p><h1>{term.label}</h1><p>{term.explanation}</p></div><span className="term-hero-icon" aria-hidden="true"><LineIcon name="book" size={54} /></span></header>
      <div className="term-content">
        {term.example && <section className="resource-card"><h2><LineIcon name="spark" size={21} /> Na prática</h2><p>{term.example}</p></section>}
        {!!term.aliases.length && <section className="resource-card"><h2>Também conhecido como</h2><div className="tag-list">{term.aliases.map((alias) => <span className="neutral-badge" key={alias}>{alias}</span>)}</div></section>}
        <section className="resource-card"><h2>Para saber mais</h2><p>Consulte material de referência sobre {term.group.toLowerCase()}.</p><a className="text-link" href={term.source} target="_blank" rel="noreferrer">Abrir documentação de referência <LineIcon name="arrowupright" size={16} /></a></section>
      </div>
      {!!links.size && <section className="related-terms"><h2>Termos relacionados</h2><div className="term-grid">{[...links.values()].slice(0, 6).map((item) => <Link className="term-card" key={item.id} href={`/dicionario/${item.id}`}><div><span>{item.group}</span><LineIcon name="arrowupright" size={17} /></div><h3>{item.label}</h3><p>{item.explanation}</p></Link>)}</div></section>}
    </article>
  </main>;
}
