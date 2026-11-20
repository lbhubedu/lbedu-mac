"use client";

import Link from "next/link";
import { useState } from "react";
import { technicalTags } from "@/lib/data/glossary";
import { toolsBySlug } from "@/lib/data/catalog";
import type { Guide } from "@/lib/data/guides";
import { LineIcon } from "./line-icons";
import { RiskBadge, TermTag, ToolIcon } from "./tool-ui";

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch { /* Clipboard permission optional. */ }
  }
  return <div className="guide-command"><code>{command}</code><button type="button" onClick={copy} className="secondary-button">{copied ? "Copiado" : "Copiar"} <LineIcon name={copied ? "check" : "command"} size={14} /></button></div>;
}

export function GuideView({ guide }: { guide: Guide }) {
  const allText = `${guide.summary} ${guide.steps.map((s) => `${s.title} ${s.body} ${s.warning ?? ""}`).join(" ")}`;
  const tags = technicalTags(allText, 12);
  const relatedTools = guide.tools.map((slug) => toolsBySlug[slug]).filter((t) => Boolean(t));

  return <main id="conteudo" tabIndex={-1} className="shell inner-page apple-home guide-page">
    <Link className="back-link" href="/guias"><LineIcon name="arrowleft" size={17} /> Voltar aos guias</Link>
    <article>
      <header className="scene-dark sub-hero method-hero">
        <div>
          <p className="hero-kicker"><span className="lime-dot" /> {guide.category.toUpperCase()} · {guide.readTime.toUpperCase()}</p>
          <h1>{guide.title}</h1>
          <p>{guide.summary}</p>
          <p className="guide-audience">{guide.audience}</p>
        </div>
      </header>
      <section className="scene-light guide-body">
        <div className="guide-steps">
          {guide.steps.map((step) => <section key={step.title} className="resource-card guide-step">
            <h2>{step.title}</h2>
            <p>{step.body}</p>
            {step.command && <CommandBlock command={step.command} />}
            {step.warning && <p className="guide-warning"><LineIcon name="shield" size={16} /> <span>{step.warning}</span></p>}
          </section>)}
        </div>

        {tags.length > 0 && <section className="resource-card guide-extra">
          <h2><LineIcon name="book" size={19} /> Termos técnicos deste guia</h2>
          <p>Passe o ponteiro ou use o foco para ver o resumo; clique para abrir o verbete completo no dicionário.</p>
          <div className="tag-list">{tags.map((term) => <TermTag key={term.id} term={term} />)}</div>
        </section>}

        {relatedTools.length > 0 && <section className="guide-tools">
          <h2>Ferramentas citadas neste guia</h2>
          <div className="tool-grid">
            {relatedTools.map((tool) => tool && <Link key={tool.slug} href={`/?ferramenta=${tool.slug}`} className="tool-card guide-tool-link">
              <div className="tool-top"><ToolIcon tool={tool} /><div className="tool-top-label"><h3>{tool.name}</h3><span className="tool-category">{tool.repo ? `github.com/${tool.repo}` : "Recurso do macOS / oficial"}</span></div></div>
              <p>{tool.description}</p>
              <div className="tool-meta"><RiskBadge risk={tool.risk} /><span>Abrir ficha <LineIcon name="arrowupright" size={13} /></span></div>
            </Link>)}
          </div>
        </section>}

        <section className="resource-card guide-extra">
          <h2><LineIcon name="fork" size={19} /> Fontes e referências oficiais</h2>
          <div className="method-sources">
            {guide.references.map((ref) => <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.label} <LineIcon name="arrowupright" size={14} /></a>)}
          </div>
        </section>
      </section>
    </article>
  </main>;
}
