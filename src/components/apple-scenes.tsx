"use client";

import { LineIcon } from "./line-icons";

import Image from "next/image";
import Link from "next/link";

import { useMemo, useState } from "react";
import { categories, categoryLabels, priceLabels, riskLabels, shortDate, type Category, type Tool } from "@/lib/data/catalog";
import { guides } from "@/lib/data/guides";
import { ToolIcon } from "./tool-ui";

export type ConfiguratorChoice = {
  category: Category | "all";
  price: string;
  risk: string;
  chip: string;
  open: boolean;
};

export function TrustStrip({ toolCount, termCount }: { toolCount: number; termCount: number }) {
  const facts = [
    [String(toolCount), "ferramentas verificadas"],
    [String(termCount), "termos explicados"],
    [String(guides.length), "guias passo a passo"],
    ["0", "posições patrocinadas"],
  ];
  return <section className="scene-light trust-strip" aria-label="Resumo do LBEdu Mac"><div className="shell trust-grid">
    <p><span className="lime-dot" /> Uma curadoria independente, feita para o seu Mac.</p>
    <dl>{facts.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
  </div></section>;
}

export function RepositoryRadar({ tools, onOpen }: { tools: Tool[]; onOpen: (slug: string) => void }) {
  const small = useMemo(() => tools.filter((tool) => typeof tool.stars === "number" && tool.stars < 1600)
    .sort((a, b) => (a.stars ?? 0) - (b.stars ?? 0)).slice(0, 6), [tools]);
  return <section className="scene-dark radar-section" id="repositorios" aria-labelledby="radar-title"><div className="shell radar-inner">
    <div className="radar-heading"><p className="eyebrow scene-eyebrow"><span className="lime-dot" /> RADAR DE REPOSITÓRIOS</p><h2 id="radar-title">Curadoria além<br /><span>das estrelas.</span></h2>
      <p>Verificamos listas públicas e repositórios com pouca visibilidade. Aqui, um projeto pequeno pode ser exatamente o que faltava para resolver o seu problema.</p></div>
    <div className="radar-layout">
      <div className="radar-visual"><Image src="/images/showcase-apple-dark.jpg" alt="Tela de Mac com painéis escuros, um gráfico verde-limão e detalhes em azul" fill sizes="(max-width: 900px) 100vw, 48vw" /><div className="radar-visual-caption"><span className="live-dot" /> Fontes abertas · sem filtro de popularidade</div></div>
      <div className="radar-list"><div className="radar-list-head"><LineIcon name="fork" size={16} /><span>Projetos de nicho no catálogo</span><small>Estrelas no levantamento</small></div>
        {small.map((tool) => <button type="button" className="radar-row" key={tool.slug} onClick={() => onOpen(tool.slug)}>
          <ToolIcon tool={tool} /><span className="radar-name"><strong>{tool.name}</strong><small>{tool.description}</small></span><span className="radar-stars"><LineIcon name="star" size={12} /> {tool.stars}</span><LineIcon name="arrowupright" size={16} />
        </button>)}
      </div>
    </div>
    <div className="radar-foot"><span>Seleção por utilidade, clareza e disponibilidade do código — não por fama.</span><Link href="/metodologia#ranking">Entenda os critérios <LineIcon name="arrowright" size={15} /></Link></div>
  </div></section>;
}

const focusOptions: { id: Category | "all"; label: string }[] = [{ id: "all", label: "Tudo" }, ...categories.map(({ id, label }) => ({ id, label }))];
const chipOptions = [["all", "Qualquer chip"], ["silicon", "Apple Silicon"], ["intel", "Intel"]] as const;
const priceOptions = [["all", "Qualquer"], ["free", "Grátis"], ["freemium", "Grátis +"], ["paid", "Pago"]] as const;
const riskOptions = [["all", "Qualquer"], ["low", "Baixo"], ["medium", "Moderado"], ["high", "Atenção"]] as const;
const riskOrder: Record<Tool["risk"], number> = { low: 0, medium: 1, high: 2 };

export function Configurator({ tools, onOpen, onApply }: { tools: Tool[]; onOpen: (slug: string) => void; onApply: (choice: ConfiguratorChoice) => void }) {
  const [focus, setFocus] = useState<Category | "all">("all");
  const [chip, setChip] = useState<(typeof chipOptions)[number][0]>("all");
  const [price, setPrice] = useState<(typeof priceOptions)[number][0]>("free");
  const [risk, setRisk] = useState<(typeof riskOptions)[number][0]>("low");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => tools.filter((tool) =>
    (focus === "all" || tool.category === focus)
    && (chip === "all" || !tool.chips?.length || tool.chips.includes(chip))
    && (price === "all" || tool.price === price || price === "free" && tool.price === "native")
    && (risk === "all" || tool.risk === risk)
    && (!open || tool.open)
  ).sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || (b.release?.published ?? "").localeCompare(a.release?.published ?? "") || a.name.localeCompare(b.name, "pt-BR")), [tools, focus, chip, price, risk, open]);
  const choice = (): ConfiguratorChoice => ({ category: focus, price: price === "all" ? "" : price, risk: risk === "all" ? "" : risk, chip: chip === "all" ? "" : chip, open });
  return <section className="scene-light configurator-section" id="configurador" aria-labelledby="configurator-title"><div className="shell config-grid">
    <div className="config-stage"><div className="config-stage-image"><Image src="/images/showcase-apple-dark.jpg" alt="Mac exibindo um painel abstrato com gráfico verde-limão e azul" fill sizes="(max-width: 900px) 100vw, 43vw" /></div>
      <div className="config-stage-note"><span className="lime-dot" /><div><strong>Configuração sob medida</strong><p>O catálogo inteiro responde às suas escolhas. Nenhuma opção é empurrada por anúncio.</p></div></div>
    </div>
    <div className="config-controls"><p className="eyebrow"><LineIcon name="cpu" size={14} /> CONFIGURADOR</p><h2 id="configurator-title">Monte seu kit.</h2><p className="config-intro">Escolha o que importa. Compare os detalhes antes de decidir.</p>
      <fieldset className="config-group"><legend>Para que você quer o Mac?</legend><div className="config-segments">{focusOptions.map((option) => <button type="button" key={option.id} aria-pressed={focus === option.id} onClick={() => setFocus(option.id)}>{option.label}</button>)}</div></fieldset>
      <div className="config-row"><fieldset className="config-group"><legend>Processador</legend><div className="config-segments compact">{chipOptions.map(([id, label]) => <button type="button" key={id} aria-pressed={chip === id} onClick={() => setChip(id)}>{label}</button>)}</div></fieldset>
        <fieldset className="config-group"><legend>Custo inicial</legend><div className="config-segments compact">{priceOptions.map(([id, label]) => <button type="button" key={id} aria-pressed={price === id} onClick={() => setPrice(id)}>{label}</button>)}</div></fieldset></div>
      <div className="config-row"><fieldset className="config-group"><legend>Nível de risco</legend><div className="config-segments compact">{riskOptions.map(([id, label]) => <button type="button" key={id} aria-pressed={risk === id} onClick={() => setRisk(id)}>{label}</button>)}</div></fieldset>
        <label className="config-check"><input type="checkbox" checked={open} onChange={(event) => setOpen(event.target.checked)} /><span>{open ? <LineIcon name="check" size={14} /> : null}</span> Somente código aberto</label></div>
      <div className="config-results"><div className="config-results-head"><div><LineIcon name="shield" size={17} /><strong>{matches.length} {matches.length === 1 ? "opção compatível" : "opções compatíveis"}</strong></div><span>Comparativo técnico</span></div>
        {matches.length ? <table><caption className="sr-only">Ferramentas compatíveis com a configuração escolhida</caption><thead><tr><th scope="col">Ferramenta</th><th scope="col">Preço</th><th scope="col">Risco</th><th scope="col">Atualização</th><th scope="col"><span className="sr-only">Abrir</span></th></tr></thead><tbody>{matches.slice(0, 3).map((tool) => <tr key={tool.slug}>
          <th scope="row"><ToolIcon tool={tool} /><span>{tool.name}<small>{categoryLabels[tool.category]}</small></span></th>
          <td>{priceLabels[tool.price]}</td><td>{riskLabels[tool.risk]}</td>
          <td>{tool.release?.published ? <time dateTime={tool.release.published}>{shortDate(tool.release.published)}</time> : tool.price === "native" ? "Com o macOS" : "Não publicada"}</td>
          <td><button type="button" className="config-open" onClick={() => onOpen(tool.slug)} aria-label={`Ver detalhes de ${tool.name}`}><LineIcon name="arrowupright" size={16} /></button></td>
        </tr>)}</tbody></table> : <p className="config-empty">Nenhuma ferramenta atende a todas essas escolhas. Experimente ampliar o custo ou o nível de risco.</p>}
      </div>
      <div className="config-actions"><button type="button" className="primary-button" onClick={() => onApply(choice())}>Aplicar ao catálogo <LineIcon name="arrowright" size={16} /></button><span><LineIcon name="spark" size={14} /> Critérios transparentes</span></div>
    </div>
  </div></section>;
}

export function GuidesBand() {
  return <section className="scene-dark guides-band" id="guias" aria-labelledby="guias-band-title"><div className="shell">
    <div className="guides-band-head">
      <div>
        <p className="eyebrow scene-eyebrow"><span className="lime-dot" /> GUIAS PRÁTICOS DE MACOS</p>
        <h2 id="guias-band-title">Resolva no Mac<br /><span>com passo a passo.</span></h2>
        <p>Procedimentos reais com comandos conferidos, caminhos nos Ajustes do Sistema e alertas de segurança antes de mexer no disco ou nas permissões.</p>
      </div>
      <Link href="/guias" className="primary-button">Ver todos os guias <LineIcon name="arrowright" size={16} /></Link>
    </div>
    <div className="guides-band-grid">
      {guides.slice(0, 4).map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="guide-band-card">
        <div className="guide-band-top"><span>{guide.category}</span><small>{guide.readTime}</small></div>
        <h3>{guide.title}</h3>
        <p>{guide.summary}</p>
        <span className="guide-band-foot">{guide.steps.length} etapas verificadas <LineIcon name="arrowupright" size={14} /></span>
      </Link>)}
    </div>
  </div></section>;
}
