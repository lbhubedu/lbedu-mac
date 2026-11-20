"use client";

import { LineIcon } from "./line-icons";

import { createPortal } from "react-dom";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, useEffect, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

import { brewPage, categoryLabels, effortLabels, installCommand, permissionsHint, priceLabels, shortDate, type Release, type Tool } from "@/lib/data/catalog";
import { technicalTags } from "@/lib/data/glossary";
import { RiskBadge, SaveButton, TermTag, ToolIcon } from "./tool-ui";

const subscribe = () => () => {};
const focusable = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]';
type Props = { tool: Tool; onDismiss: () => void; onRelease: (slug: string, release: Release) => void };
type Sample = { id: number; start: number; origin: number; last: number; time: number; speed: number; active: boolean };

export function ToolDrawer(props: Props) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return ready ? createPortal(<Drawer {...props} />, document.body) : null;
}

function Drawer({ tool, onDismiss, onRelease }: Props) {
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const width = useMotionValue(520);
  const shade = useTransform(() => Math.max(0, Math.min(1, 1 - x.get() / width.get())));
  const reduce = useReducedMotion();
  const animation = useRef<{ stop: () => void } | null>(null);
  const serial = useRef(0);
  const drag = useRef<Sample | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedBrew, setCopiedBrew] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const settle = useCallback((close: boolean, velocity = 0, fromGesture = false) => {
    animation.current?.stop();
    const serialNow = ++serial.current;
    const at = close ? width.get() + 2 : 0;
    if (reduce) { x.jump(at); if (close) onDismiss(); return; }
    const spring = animate(x, at, {
      type: "spring", stiffness: 330, damping: !close && fromGesture && Math.abs(velocity) > 540 ? 30 : 37, mass: 1,
      velocity: Math.max(-1800, Math.min(1800, velocity)), restDelta: 0.6, restSpeed: 7,
    });
    animation.current = spring;
    if (close) void spring.then(() => { if (serial.current === serialNow) onDismiss(); });
  }, [onDismiss, reduce, width, x]);

  useLayoutEffect(() => {
    if (!panel.current) return;
    width.jump(panel.current.getBoundingClientRect().width);
    x.jump(reduce ? 0 : width.get() + 2);
    settle(false);
    const updateWidth = () => { if (panel.current) width.set(panel.current.getBoundingClientRect().width); };
    window.addEventListener("resize", updateWidth);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const underlying = document.getElementById("app-content");
    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;
    const scrollWidth = window.innerWidth - document.documentElement.clientWidth;
    closeButton.current?.focus({ preventScroll: true });
    if (underlying) underlying.inert = true;
    document.body.style.overflow = "hidden";
    if (scrollWidth > 0) document.body.style.paddingRight = `${scrollWidth}px`;
    return () => {
      serial.current++;
      animation.current?.stop();
      window.removeEventListener("resize", updateWidth);
      if (underlying) underlying.inert = false;
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
      if (active?.isConnected && active !== document.body) active.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>("#catalog-search")?.focus({ preventScroll: true });
    };
  }, [reduce, settle, width, x]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/lancamentos/${tool.slug}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null).then((value: { release?: Release } | null) => {
      if (value?.release && !controller.signal.aborted) onRelease(tool.slug, value.release);
    }).catch(() => {});
    return () => controller.abort();
  }, [tool.slug, onRelease]);

  function grab(event: PointerEvent<HTMLDivElement>) {
    if (reduce || !event.isPrimary || event.button !== 0) return;
    animation.current?.stop();
    serial.current++;
    drag.current = { id: event.pointerId, start: event.clientX, origin: x.get(), last: event.clientX, time: event.timeStamp, speed: 0, active: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const sample = drag.current;
    if (!sample || sample.id !== event.pointerId) return;
    const delta = event.clientX - sample.start;
    if (!sample.active && Math.abs(delta) >= 10) sample.active = true;
    const elapsed = Math.max(1, event.timeStamp - sample.time);
    const currentSpeed = (event.clientX - sample.last) / elapsed * 1000;
    sample.speed = sample.speed * 0.55 + currentSpeed * 0.45;
    sample.last = event.clientX;
    sample.time = event.timeStamp;
    if (!sample.active) return;
    const end = width.get();
    const proposed = sample.origin + delta;
    const elastic = (distance: number) => (distance * 0.23) / (1 + distance / 145);
    x.set(proposed < 0 ? -elastic(-proposed) : proposed > end ? end + elastic(proposed - end) : proposed);
  }
  function release(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const sample = drag.current;
    if (!sample || sample.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const velocity = cancelled || event.timeStamp - sample.time > 90 || !sample.active ? 0 : Math.max(-1800, Math.min(1800, sample.speed));
    const projection = x.get() + velocity * 0.17;
    settle(!cancelled && projection > width.get() * 0.48, velocity, sample.active);
  }

  const tags = technicalTags(`${tool.description} ${tool.how} ${tool.first} ${tool.caution} ${permissionsHint(tool)}`);
  const officialBrew = brewPage(tool);
  const brewCmd = installCommand(tool);
  const permissions = permissionsHint(tool);
  const date = tool.release?.published;
  const domain = (() => { try { return new URL(tool.website).hostname.replace(/^www\./, ""); } catch { return tool.website; } })();
  const chipText = tool.chips?.length === 1 ? tool.chips[0] === "silicon" ? "Apple Silicon" : "Intel" : tool.chips?.length ? "Apple Silicon e Intel" : "Verifique na fonte";
  async function copy() {
    try {
      const url = new URL("/", window.location.origin);
      url.searchParams.set("ferramenta", tool.slug);
      await navigator.clipboard.writeText(url.toString()); setCopied(true); setCopyError(false);
    } catch { setCopyError(true); }
  }
  async function copyCommand() {
    if (!brewCmd) return;
    try {
      await navigator.clipboard.writeText(brewCmd);
      setCopiedBrew(true);
      setTimeout(() => setCopiedBrew(false), 2500);
    } catch { setCopyError(true); }
  }

  return <div className="drawer-root">
    <motion.div className="drawer-scrim" style={{ opacity: shade }} aria-hidden="true" onClick={() => settle(true, Math.max(0, x.getVelocity()))} />
    <motion.aside ref={panel} className="tool-drawer" role="dialog" aria-modal="true" aria-labelledby="tool-dialog-title" style={{ x }} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); settle(true, Math.max(0, x.getVelocity())); }
      if (event.key === "Tab") {
        const items = [...(panel.current?.querySelectorAll<HTMLElement>(focusable) ?? [])].filter((element) => element.getClientRects().length > 0);
        if (!items.length) return;
        if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
      }
    }}>
      <div className="drawer-bar"><div className="drawer-grab" aria-hidden="true" onPointerDown={grab} onPointerMove={move} onPointerUp={release} onPointerCancel={(event) => release(event, true)} onLostPointerCapture={(event) => release(event, true)}><span /></div><button ref={closeButton} className="icon-button drawer-close" type="button" aria-label="Fechar detalhes" onClick={() => settle(true, Math.max(0, x.getVelocity()))}><LineIcon name="x" size={21}  /></button></div>
      <div className="drawer-body">
        <div className="drawer-intro"><ToolIcon tool={tool} large /><div><p className="eyebrow">{categoryLabels[tool.category]}</p><h2 id="tool-dialog-title">{tool.name}</h2></div><SaveButton tool={tool} /></div>
        <p className="drawer-summary">{tool.description}</p>
        <div className="drawer-badges"><RiskBadge risk={tool.risk} /><span className="neutral-badge">{priceLabels[tool.price]}</span>{tool.open && <span className="neutral-badge">Código aberto</span>}<span className="neutral-badge">{effortLabels[tool.effort ?? "simple"]}</span></div>
        <div className="detail-facts">
          <div><LineIcon name="calendar" size={17} aria-hidden="true" /><span>Última atualização</span><strong>{date ? <time dateTime={date}>{shortDate(date)}</time> : tool.price === "native" ? "Junto com o macOS" : "Data não publicada"}</strong>{tool.release?.version && <small>Versão {tool.release.version}</small>}</div>
          <div><LineIcon name="cpu" size={17} aria-hidden="true" /><span>Compatibilidade</span><strong>{chipText}</strong><small>{tool.minMac ? `macOS ${tool.minMac} ou mais recente` : "Confira a versão mínima na fonte"}</small></div>
          <div><LineIcon name="lock" size={17} aria-hidden="true" /><span>Permissões</span><strong>{permissions}</strong><small>Revise em Ajustes do Sistema</small></div>
          <div><LineIcon name="fork" size={17} aria-hidden="true" /><span>Origem verificada</span><strong>{tool.repo ? tool.repo : domain}</strong><small>{tool.license ? `Licença ${tool.license}` : tool.open ? "Código aberto" : "Software proprietário / nativo"}{typeof tool.stars === "number" ? ` · ${tool.stars.toLocaleString("pt-BR")} estrelas` : ""}</small></div>
        </div>
        {brewCmd && <div className="brew-command"><div className="brew-command-meta"><span>Instalação via Homebrew</span><code>{brewCmd}</code></div><button type="button" className="secondary-button brew-copy" onClick={copyCommand}>{copiedBrew ? "Copiado" : "Copiar"} <LineIcon name={copiedBrew ? "check" : "command"} size={14} /></button></div>}
        <section className="detail-section"><h3><LineIcon name="circlehelp" size={18} /> Como funciona</h3><p>{tool.how}</p></section>
        <section className="detail-section"><h3><LineIcon name="arrowright" size={18} /> Como começar</h3><p>{tool.first}</p></section>
        <section className="detail-section detail-checklist"><h3><LineIcon name="check" size={18} /> Antes de adotar</h3><ul>
          <li>Confirme o nome do desenvolvedor e o endereço oficial antes de baixar.</li>
          <li>Leia as permissões pedidas e conceda apenas o necessário para a tarefa.</li>
          <li>{tool.license ? `Licença do código: ${tool.license}. ` : "Licença não confirmada na fonte pública. "}Verifique a edição compatível com seu macOS no link oficial.</li>
          <li>Faça uma cópia dos seus dados antes de alterar arquivos, permissões ou o sistema.</li>
        </ul></section>
        <section className="detail-section detail-caution"><h3><LineIcon name="shield" size={18} /> Cuidados e riscos</h3><p>{tool.caution}</p></section>
        {tags.length > 0 && <section className="detail-section"><h3><LineIcon name="book" size={18} /> Termos explicados</h3><div className="tag-list">{tags.map((term) => <TermTag key={term.id} term={term} />)}</div></section>}
        <section className="detail-section drawer-sources"><h3><LineIcon name="fork" size={18} /> Fontes e versões</h3><div>
          {tool.repo && <a href={`https://github.com/${tool.repo}`} target="_blank" rel="noreferrer">Repositório no GitHub <LineIcon name="arrowupright" size={14} /></a>}
          {officialBrew && <a href={officialBrew} target="_blank" rel="noreferrer">Homebrew Formulae <LineIcon name="arrowupright" size={14} /></a>}
          {(tool.release?.url || tool.changelog) && <a href={tool.release?.url || tool.changelog} target="_blank" rel="noreferrer">{tool.release?.published ? `Data: ${tool.release.source}` : "Histórico ou versão disponível"} <LineIcon name="arrowupright" size={14} /></a>}
          {!tool.repo && !officialBrew && !tool.release?.url && !tool.changelog && <p>Informações e requisitos no site oficial.</p>}
        </div></section>
      </div>
      <div className="drawer-footer"><a className="primary-button" href={tool.website} target="_blank" rel="noreferrer">{tool.price === "native" ? "Abrir guia oficial" : "Visitar site oficial"} <LineIcon name="arrowupright" size={16} /></a><button className="secondary-button" type="button" onClick={copy}><span>{copied ? "Copiado!" : "Copiar link"}</span>{copied ? <LineIcon name="check" size={16} /> : <LineIcon name="link" size={16}  />}</button>{copyError && <small role="alert">Seu navegador não permitiu copiar.</small>}</div>
    </motion.aside>
  </div>;
}
