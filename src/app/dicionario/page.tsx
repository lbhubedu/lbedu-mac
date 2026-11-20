import type { Metadata } from "next";
import { Dictionary } from "@/components/dictionary";

export const metadata: Metadata = { title: "Dicionário de tecnologia", description: "Glossário em português simples para macOS, desenvolvimento, segurança, redes, hardware e inteligência artificial." };

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ termo?: string }> }) {
  const { termo } = await searchParams;
  const query = typeof termo === "string" ? termo.slice(0, 100) : "";
  return <Dictionary key={query} query={query} />;
}
