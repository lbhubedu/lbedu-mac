import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/data/guides";
import { LineIcon } from "@/components/line-icons";

export const metadata: Metadata = {
  title: "Guias práticos de macOS",
  description: "Passo a passo em português simples sobre segurança, armazenamento, desempenho, permissões e backup no Mac.",
};

export default function GuidesIndexPage() {
  return <main id="conteudo" tabIndex={-1} className="shell inner-page apple-home">
    <section className="scene-dark sub-hero method-hero">
      <div>
        <p className="hero-kicker"><span className="lime-dot" /> GUIAS PRÁTICOS LBEDU MAC</p>
        <h1>Aprenda a cuidar<br /><span>do seu Mac.</span></h1>
        <p>Procedimentos objetivos, comandos conferidos e avisos claros sobre o que evitar no macOS.</p>
      </div>
    </section>
    <section className="scene-light dictionary-list" aria-labelledby="guias-lista">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow section-kicker"><span /> Passo a passo</p>
          <h2 id="guias-lista">Todos os guias</h2>
          <p>Cada guia reúne caminhos reais nos Ajustes do Sistema, comandos verificados e termos explicados.</p>
        </div>
      </div>
      <div className="term-grid guide-grid">
        {guides.map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="term-card guide-card">
          <div><span>{guide.category} · {guide.readTime}</span><LineIcon name="arrowupright" size={17} /></div>
          <h3>{guide.title}</h3>
          <p>{guide.summary}</p>
          <small>{guide.steps.length} etapas · {guide.tools.length} ferramentas relacionadas</small>
        </Link>)}
      </div>
    </section>
  </main>;
}
