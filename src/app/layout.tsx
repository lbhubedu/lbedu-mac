import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { getFavorites } from "@/lib/favorites";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LBEdu Mac — Tudo para o seu Mac", template: "%s · LBEdu Mac" },
  description: "Descubra ferramentas para macOS, compare riscos e atualizações, resolva problemas com o assistente e entenda tecnologia em português simples.",
  applicationName: "LBEdu Mac",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = await getFavorites();
  return <html lang="pt-BR" suppressHydrationWarning><body><SiteShell initialSaved={saved}>{children}</SiteShell></body></html>;
}
