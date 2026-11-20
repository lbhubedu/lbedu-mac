import { fold, type Chip, type Price, type Tool } from "@/lib/data/catalog";
import { trainTaskClassifier } from "@/lib/local-language";

const tasks: [id: string, title: string, examples: string][] = [
  ["disco", "liberar espaço no disco", "liberar espaço|mac cheio|disco cheio|armazenamento cheio|limpar disco|arquivos grandes|ocupando espaço|dados do sistema|sem espaço|liberar armazenamento|ssd cheio|espaço|armazenamento"],
  ["janelas", "organizar janelas", "organizar janelas|dividir tela|encaixar janelas|redimensionar janelas|janelas lado a lado|tiling|organizar as janelas|janelas"],
  ["alternar", "alternar entre janelas", "trocar de janela|alternar janelas|alternar entre janelas|atalho alt tab|miniaturas das janelas|alt tab|cmd tab"],
  ["busca", "abrir apps e localizar arquivos", "abrir aplicativos|abrir apps|buscar arquivos|encontrar arquivo|localizar arquivos|substituir spotlight|launcher|spotlight"],
  ["automacao", "automatizar tarefas", "automatizar tarefas|automação|automatizar|criar macro|macros|executar ações por atalho"],
  ["clipboard", "recuperar textos copiados", "histórico de copiar e colar|área de transferência|textos copiados|copiei antes|histórico da área|clipboard|copiar e colar"],
  ["notas", "organizar anotações", "tomar notas|escrever notas|anotar ideias|fazer anotações|segundo cérebro|zettelkasten|anotações|notas|wiki pessoal"],
  ["teclado", "personalizar o teclado", "remapear teclas|remapear teclado|trocar função das teclas|mudar a tecla|teclado windows no mac|remapear"],
  ["tarefas", "montar listas de tarefas", "lista de tarefas|organizar tarefas|tarefas pessoais|to do|checklist"],
  ["calendario", "consultar a agenda", "ver eventos|calendário na barra|agenda|calendário|compromissos"],
  ["terminal", "usar o Terminal", "emulador de terminal|abas no terminal|substituir o terminal|terminal alternativo|console|shell|terminal"],
  ["pacotes", "instalar e atualizar pacotes", "gerenciar pacotes|gerenciador de pacotes|instalar ferramentas|instalar programas pelo terminal|instalar dependências|brew install|homebrew|pacotes"],
  ["editor", "escrever e editar código", "editor de código|editor de texto para código|escrever código|editar código|ide|programar|codificar"],
  ["web", "desenvolver um site no Mac", "criar um site|desenvolver sites|projeto web|desenvolvimento web|aplicativo web|frontend|front end|html|css|site"],
  ["git", "controlar versões de código", "controle de versão|gerenciar versões do projeto|visualizar commits|versionar código|commit|branches|git"],
  ["api", "testar APIs", "testar api|chamadas http|chamar endpoints|requisição http|api rest|substituir postman|postman|api"],
  ["banco", "consultar bancos de dados", "banco de dados|administrar banco|visualizar tabelas|consultas sql|mysql|postgresql|sqlite|sql|postgres"],
  ["python", "preparar um ambiente Python", "ambiente python|ambiente virtual|dependências python|versões de python|python|pip|venv"],
  ["javascript", "rodar JavaScript no Mac", "rodar javascript|instalar node|executar javascript|versões do node|javascript|node.js|nodejs|npm"],
  ["containers", "rodar contêineres", "rodar docker|executar contêineres|docker compose|alternativa ao docker desktop|contêineres|containers|docker"],
  ["vm", "criar ou usar máquinas virtuais", "rodar windows|instalar linux em vm|rodar linux|máquina virtual|máquinas virtuais|virtualização|emular linux|virtual machine|vm"],
  ["compactar", "criar ou abrir arquivos compactados", "criar um zip|compactar arquivos|diminuir tamanho dos arquivos|compactar pasta|compactar|comprimir pasta|zip"],
  ["extrair", "extrair um arquivo compactado", "abrir rar|extrair arquivos|descompactar arquivos|descompactar|abrir zip|abrir 7z|arquivo rar|rar|7z"],
  ["transferencia", "enviar arquivos entre aparelhos", "enviar arquivos|passar arquivos|transferir arquivos|transferir fotos|mac para android|android para o mac|alternativa ao airdrop|compartilhar arquivos pela rede|airdrop|transferência"],
  ["remoto", "acessar arquivos de um servidor", "conectar ao servidor|acessar s3|acessar sftp|transferir por ftp|servidor remoto|webdav|sftp|ftp"],
  ["backup", "fazer ou recuperar uma cópia de segurança", "fazer backup|fazer uma cópia de segurança|cópia de segurança|backup automático|recuperar backup|restaurar arquivos|backup|backups"],
  ["sincronizar", "sincronizar pastas", "sincronizar pastas|sincronizar arquivos|espelhar pastas|sincronização de pastas|sincronização|sincronizar"],
  ["desinstalar", "remover apps e seus arquivos de suporte", "desinstalar aplicativos|remover aplicativos|apagar apps|desinstalar app|limpar sobras|remover app|desinstalar"],
  ["desempenho", "diagnosticar lentidão ou consumo de recursos", "mac está lento|mac ficou lento|mac lento|ram em uso|uso da memória|processador em uso|consumo de cpu|mac travando|monitorar desempenho|mac esquentando|monitorar recursos|cpu|ram|lento|desempenho"],
  ["bateria", "entender o consumo de bateria", "bateria acabando|consumo de bateria|duração da bateria|saúde da bateria|monitorar bateria|bateria"],
  ["carga", "limitar a carga da bateria", "limitar carga|limite de carga|carregar até 80|carregar só até|restringir carregamento|limitar carregamento"],
  ["senhas", "guardar e proteger senhas", "guardar senhas|gerenciar senhas|cofre de senhas|salvar senhas|gerenciador de senhas|password manager|lembrar senhas|senha mestra|senhas|passkey"],
  ["criptografia", "criptografar dados", "proteger arquivos|proteger pastas|criptografar arquivos|criptografar pasta|proteger disco|colocar senha nos arquivos|criptografar disco|cifrar|criptografia|filevault"],
  ["protecao", "verificar a segurança do Mac", "suspeita de malware|o mac foi roubado|verificar vírus|proteger o mac|segurança do mac|verificar malware|malware"],
  ["firewall", "decidir quais apps acessam a internet", "bloquear conexão de um app|bloquear internet de um aplicativo|bloquear conexões|firewall de saída|firewall"],
  ["rede", "observar conexões de rede", "ver conexões de rede|monitorar tráfego|uso da rede|conexões de rede|monitorar rede"],
  ["vpn", "usar uma VPN", "vpn gratuita|vpn para mac|rede privada virtual|wi-fi público|túnel vpn|vpn"],
  ["captura", "capturar e anotar imagens da tela", "tirar print|fazer print|captura de tela|capturar a tela|anotar uma captura|screenshot|print"],
  ["gravar", "gravar a tela ou transmitir vídeo", "gravar a tela|gravar tela|gravação de tela|gravar webcam|transmitir ao vivo|capturar vídeo da tela|fazer live|twitch|streaming ao vivo"],
  ["video", "converter ou compactar vídeo", "converter vídeo|reduzir vídeo|compactar vídeo|comprimir vídeo|vídeo muito grande|trocar formato de vídeo|diminuir tamanho de um vídeo|tamanho do vídeo|converter mp4|codec"],
  ["audio", "editar ou gravar áudio", "editar áudio|gravar áudio|reduzir ruído|remover ruído|editar podcast|gravar podcast|microfone|cortar áudio|áudio|podcast"],
  ["midia", "reproduzir vídeos e legendas", "reproduzir vídeo|reproduzir mkv|abrir vídeo|assistir filme|assistir vídeo|player de vídeo|abrir legenda|rodar mkv|legendas|mkv|player"],
  ["imagem", "editar e retocar imagens", "editar foto|editar imagem|retocar fotos|editar imagens|alternativa photoshop|photoshop|recortar foto|desenhar"],
  ["fotos", "tratar fotos", "tratamento de fotos|editar fotografias|retocar foto|filtro de fotos|fotografia"],
  ["vetor", "criar desenhos vetoriais", "imagem vetorial|criar logo|fazer um logo|criar ícones|vetorizar imagem|vetores|svg|vetor|logotipo"],
  ["otimizar-imagem", "reduzir o tamanho de fotos e imagens", "comprimir imagens|compactar imagem|diminuir tamanho da foto|reduzir fotos|tirar exif|otimizar imagem|reduzir imagem|comprimir foto|reduzir o tamanho de fotos|reduzir imagens"],
  ["3d", "modelar ou animar em 3D", "modelagem 3d|modelar em 3d|criar um modelo 3d|renderizar em 3d|animação 3d|3d"],
  ["manutencao", "fazer manutenção do macOS", "reconstruir índice|verificar disco|limpar caches|manutenção do sistema|limpeza avançada|cache do mac"],
  ["ia", "rodar um modelo de IA no Mac", "rodar um llm|rodar ia local|rodar um modelo local|ia offline|modelo de linguagem local|on-device|mlx|llm|ia local"],
  ["menubar", "organizar a barra de menus", "barra de menus|esconder icones|organizar icones da barra|icons da barra de menus|menu bar|menubar|personalizar a barra|mostrar scripts na barra|entalhe|notch"],
  ["monitor-externo", "controlar brilho de um monitor externo", "brilho do monitor|brilho de monitor externo|controlar monitor externo|volume do monitor|ddc|tela externa|display externo"],
  ["mouse", "personalizar botões e rolagem do mouse", "botoes do mouse|configurar mouse|mouse de terceiros|rolagem do mouse|scroll do mouse|gestos do mouse|personalizar mouse"],
  ["quicklook", "pré-visualizar arquivos no Finder", "quick look|barra de espaco|pre visualizar arquivo|preview no finder|visualizar markdown no finder|previa de arquivos|abrir preview"],
  ["ssh", "proteger chaves SSH", "chave ssh|chaves ssh|secure enclave|autenticacao ssh|proteger ssh|assinatura git"],
  ["cafeina", "impedir que o Mac durma", "nao dormir|nao deixar o mac dormir|manter acordado|manter o mac acordado|evitar suspensao|impedir que o mac durma|tela nao apagar|caffeine"],
  ["arquivos-abertos", "ver arquivos abertos por processos", "arquivo aberto por processo|quem esta usando o arquivo|arquivos abertos|sockets|pipes|lsof|conexoes de processos"],
  ["finder", "abrir pastas do Finder no Terminal", "abrir pasta no terminal|finder no terminal|atalho no finder|abrir terminal na pasta|acessar pasta pelo terminal"],
  ["atualizacoes", "acompanhar atualizações do macOS", "atualizar macos|forcar atualizacao|atualizacoes de seguranca|versao minima do macos|gerenciar atualizacoes|nudge"],
  ["xcode", "gerenciar versões do Xcode", "instalar xcode|trocar versao do xcode|multiplas versoes do xcode|command line tools|desenvolver para ios"],
  ["privacidade", "monitorar câmera e microfone", "camera ativada|microfone ativado|webcam|quem esta usando a camera|monitorar microfone|privacidade da camera|privacidade do microfone"],
  ["navegacao", "navegar usando apenas o teclado", "navegar com teclado|sem mouse|atalhos de navegacao|clicar com teclado|vimium|dicas de teclado"],
  ["startup", "examinar itens que iniciam junto do Mac", "inicializacao do mac|programas iniciando sozinhos|itens de inicio|abrir ao ligar|apps iniciando|iniciar junto|startup|launchd|launchagent|launchdaemon|persistencia"],
  ["rss", "acompanhar sites e feeds RSS", "leitor rss|feed rss|feeds atom|acompanhar blogs|noticias sem algoritmo"],
];

const tidy = (value: string) => fold(value).replace(/[^a-z0-9.]+/g, " ").trim().replace(/\s+/g, " ");
const taskIndex = tasks.map(([id, label, examples]) => ({ id, label, examples: examples.split("|").map(tidy) }));
const predictTask = trainTaskClassifier(taskIndex);
const includesPhrase = (phrase: string, text: string) => (` ${text.replace(/\.(?=\s|$)/g, "")} `).includes(` ${phrase} `);
export const AI_TASKS = tasks.map(([id, label]) => `${id}: ${label}`).join("\n");
const allowedIds = new Set(tasks.map(([id]) => id));
export function validIntents(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && allowedIds.has(entry)))].slice(0, 3) : [];
}
export function decodeIntents(text: string) {
  try { return validIntents((JSON.parse(text.match(/\{[\s\S]*?\}/)?.[0] ?? "{}") as { intents?: unknown }).intents); }
  catch { return []; }
}

export const scoreWeights = { fit: 55, safety: 20, upkeep: 15, cost: 10 };
export type Recommendation = { slug: string; score: number; reason: string; scores: typeof scoreWeights; compatibility: string };
export type Analysis = { engine: string; targets: string[]; preferences: string[]; items: Recommendation[]; guidance: string; externalUnavailable?: boolean };

export function rankTools(list: Tool[], problem: string, extra: string[], engine: string): Analysis {
  const text = tidy(problem);
  const chip: Chip | undefined = /\b(intel|x86|x64)\b/.test(text) ? "intel" : /\b(silicon|m[1-9]|arm64)\b/.test(text) ? "silicon" : undefined;
  const namedSystems: Record<string, number> = { big: 11, monterey: 12, ventura: 13, sonoma: 14, sequoia: 15, tahoe: 26 };
  const version = Number(text.match(/\bmacos (\d+)\b/)?.[1]) || Object.entries(namedSystems).find(([name]) => includesPhrase(name === "big" ? "big sur" : name, text))?.[1];
  const onlyFree = /\b(gratis|gratuit[oa]s?|sem pagar|sem assinatura|de graca)\b/.test(text);
  const noExtras = /\b(sem extras pagos|totalmente gratuit[oa]|100 gratuit[oa])\b/.test(text);
  const onlyOpen = /\b(codigo aberto|open source|software livre)\b/.test(text);
  const onlyNative = /\b(sem instalar|sem baixar|ja vem no mac|recurso nativo|so ferramentas nativas)\b/.test(text);
  const preferences = [chip ? chip === "intel" ? "Mac Intel" : "Apple Silicon" : "", version ? `macOS ${version}` : "", onlyFree ? "Sem pagamento obrigatório" : "", onlyOpen ? "Código aberto" : "", onlyNative ? "Só recursos do macOS" : ""].filter(Boolean);
  const matches = taskIndex.map(({ id, label, examples }) => {
    const hits = new Set(examples.filter((phrase) => includesPhrase(phrase, text)));
    const longest = Math.max(0, ...[...hits].map((phrase) => phrase.split(" ").length === 1 ? 2 : Math.min(6, 2 + phrase.split(" ").length)));
    return { id, label, weight: longest + (hits.size > 1 ? 0.15 : 0) };
  });
  const baseMax = Math.max(0, ...matches.map(({ weight }) => weight));
  const predicted = !extra.length && baseMax < 4 ? predictTask(text) : null;
  for (const match of matches) {
    if (extra.includes(match.id)) match.weight = match.weight ? match.weight + 0.55 : baseMax >= 4 ? baseMax * 0.55 : Math.max(2.6, baseMax);
    else if (match.id === predicted) match.weight = Math.max(3.65, match.weight);
  }
  if (predicted && engine === "Critérios locais") engine = "Classificador local";
  const targets = matches.filter(({ weight }) => weight > 0).sort((a, b) => b.weight - a.weight);
  const max = targets[0]?.weight ?? 1;
  const focused = targets.filter(({ weight }) => weight >= max * 0.64).slice(0, 3);
  const cost: Record<Price, number> = { native: 1, free: 0.95, freemium: 0.72, paid: 0.36 };
  const effortRank = { simple: 0, medium: 1, advanced: 2 };
  const safety = { low: 1, medium: 0.58, high: 0.22 };
  const today = Date.now();
  const choices = list.flatMap((tool) => {
    if (chip && tool.chips?.length && !tool.chips.includes(chip)) return [];
    if (version && tool.minMac && version < tool.minMac) return [];
    if ((onlyFree && tool.price === "paid") || (noExtras && tool.price === "freemium") || (onlyOpen && !tool.open) || (onlyNative && tool.price !== "native")) return [];
    const primary = tidy(tool.name);
    const exact = primary.length >= 3 && includesPhrase(primary, text);
    const supported = Object.fromEntries(tool.intents.split(",").map((value) => {
      const [id, strength] = value.split(":");
      return [id, strength ? Number(strength) : 1];
    }));
    const raw = focused.map((task) => ({ label: task.label, fit: (supported[task.id] ?? 0) * (task.weight / max) })).sort((a, b) => b.fit - a.fit);
    const best = raw[0];
    const fit = Math.min(1, Math.max(exact ? (best?.fit ? 1 : 0.84) : 0, (best?.fit ?? 0) + (raw[1]?.fit ?? 0) * 0.12));
    if (fit < 0.53) return [];
    const age = tool.release?.published ? Math.max(0, (today - Date.parse(tool.release.published)) / 86_400_000) : null;
    const upkeep = tool.price === "native" ? 0.87 : age === null ? 0.50 : age <= 180 ? 1 : age <= 365 ? 0.80 : age <= 730 ? 0.63 : 0.37;
    const scores = { fit: Math.round(fit * scoreWeights.fit), safety: Math.round(safety[tool.risk] * scoreWeights.safety), upkeep: Math.round(upkeep * scoreWeights.upkeep), cost: Math.round(cost[tool.price] * scoreWeights.cost) };
    const score = scores.fit + scores.safety + scores.upkeep + scores.cost;
    const compatibility = version && !tool.minMac && tool.price !== "native" ? `Requisito para macOS ${version} não confirmado. Confira na fonte.` :
      tool.minMac && !version ? `Requer macOS ${tool.minMac} ou superior; confira a edição.` :
      tool.chips?.length === 1 && !chip ? "Somente Apple Silicon." : "Confira os requisitos da edição antes de começar.";
    const reason = best?.fit ? `${best.fit >= 0.85 ? "Atende diretamente à tarefa de" : "Pode ajudar em"} ${best.label}. ${tool.description}` : `Você mencionou esta ferramenta. ${tool.description}`;
    return [{ slug: tool.slug, score, reason, scores, compatibility, effort: effortRank[tool.effort ?? "medium"], fit: scores.fit, name: tool.name }];
  }).sort((a, b) => b.score - a.score || b.fit - a.fit || a.effort - b.effort || a.name.localeCompare(b.name, "pt-BR"));
  return {
    engine, targets: focused.map(({ label }) => label), preferences,
    items: choices.slice(0, 4).map(({ slug, score, reason, scores, compatibility }) => ({ slug, score, reason, scores, compatibility })),
    guidance: choices.length ? "Compare os cuidados e a compatibilidade antes de escolher. A nota mede a adequação a esta busca, não certifica a segurança." :
      focused.length ? "Não encontrei uma opção que atenda bem a essa tarefa e às suas preferências. Tente descrever uma etapa mais específica ou revisar as restrições." : "Não consegui identificar a tarefa com confiança. Diga o que você quer fazer no Mac, por exemplo: ‘Quero liberar espaço sem instalar outro app’. Se souber, inclua o chip, o macOS e o orçamento.",
  };
}
