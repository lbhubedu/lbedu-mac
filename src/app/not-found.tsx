import Link from "next/link";
import { LineIcon } from "@/components/line-icons";

export default function NotFound() {
  return <main id="conteudo" tabIndex={-1} className="shell inner-page apple-home">
    <section className="scene-dark sub-hero term-hero"><div><p className="hero-kicker"><LineIcon name="search" size={15} /> Página não encontrada</p><h1>Não encontramos <span>esta página.</span></h1><p>O endereço pode ter mudado. Volte ao início ou procure o termo no dicionário.</p></div></section>
    <div className="term-content"><div className="resource-card"><Link href="/" className="text-link"><LineIcon name="arrowleft" size={16} /> Voltar para o início</Link></div><div className="resource-card"><Link href="/dicionario" className="text-link">Buscar no dicionário</Link></div></div>
  </main>;
}
