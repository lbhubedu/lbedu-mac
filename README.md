# lbedumac · LBEdu Mac

Catálogo independente em português para macOS, com 100 ferramentas verificadas, 6 guias práticos, recomendações explicáveis e dicionário com 330 termos. Next.js (App Router), PostgreSQL opcional via Drizzle ORM.

## Deploy na Vercel (com ou sem banco)

O projeto está pronto para subir na **Vercel** (via Vercel CLI, importação de pasta / Vercel Drop no painel ou repositório Git) sem exigir configuração obrigatória:

1. **Sem configurar banco (`DATABASE_URL` vazio):**
   - O aplicativo detecta automaticamente a ausência de `DATABASE_URL` e roda em modo stateless.
   - Os favoritos ficam persistidos em cookie HTTP-only (`lbedumac_saved`).
   - As datas e versões usam o snapshot verificado (`src/lib/data/release-snapshot.json`) com atualização sob demanda em cache de memória.
   - `/api/health` responde `{ "ok": true, "mode": "stateless" }`.
2. **Com PostgreSQL (Vercel Postgres / Neon / Supabase / local):**
   - Defina `DATABASE_URL` nas Environment Variables da Vercel e execute `npx drizzle-kit push` uma vez.
   - `/api/health` responde `{ "ok": true, "mode": "postgres" }`.
3. **Variáveis opcionais de IA (servidor):**
   - `KILO_API_KEY` (e opcional `KILO_MODEL`): habilita o Kilo Gateway no servidor.
   - `POLLINATIONS_API_KEY` (e opcional `POLLINATIONS_MODEL`): habilita a API autenticada da Pollinations.
   - Sem chaves, o assistente funciona com o classificador local em português e, quando autorizado pelo usuário, tenta a API clássica gratuita da Pollinations.
   - `GITHUB_TOKEN`: opcional, aumenta o limite de consultas ao GitHub Releases.

### Comandos rápidos

```bash
npm install
npm run build
npx vercel --prod
```

## Fontes e verificação

- As ferramentas foram conferidas em fontes públicas: GitHub (repositórios, licenças SPDX e histórico de lançamentos), Homebrew Formulae (`formulae.brew.sh`), Suporte da Apple e listas abertas (Awesome Mac, awesome-macOS, OpenMacApps, Open Source macOS Apps e Objective-See).
- Cada ficha exibe origem verificada, permissões solicitadas pelo macOS, comando oficial do Homebrew (quando disponível), checklist "Antes de adotar", riscos e termos técnicos clicáveis.
- A página `/metodologia` documenta os pesos do ranking, critérios de entrada/exclusão, limites da verificação e a especificação de movimento A–F.
