export type GuideStep = {
  title: string;
  body: string;
  command?: string;
  warning?: string;
};

export type Guide = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  audience: string;
  steps: GuideStep[];
  tools: string[];
  references: { label: string; url: string }[];
};

export const guides: Guide[] = [
  {
    slug: "mac-novo",
    category: "Primeiros passos",
    title: "Como configurar um Mac novo sem instalar programas desnecessários",
    summary: "Checklist prático para segurança, energia, backup e instalação de ferramentas em Macs Apple Silicon ou Intel.",
    readTime: "6 min",
    audience: "Para quem acabou de ligar um Mac ou reinstalou o macOS",
    steps: [
      {
        title: "1. Atualize o macOS e ative o FileVault antes de copiar seus arquivos",
        body: "Abra Ajustes do Sistema → Geral → Atualização de Software para garantir as correções de segurança mais recentes. Em seguida, vá em Privacidade e Segurança → FileVault e ative a criptografia de disco, guardando a chave de recuperação em um local separado do computador.",
        warning: "Se você esquecer a senha da conta e perder a chave de recuperação do FileVault, os dados do SSD não podem ser recuperados.",
      },
      {
        title: "2. Confira qual chip seu Mac usa e se o Rosetta 2 é necessário",
        body: "Clique no menu Apple no canto superior esquerdo e escolha Sobre Este Mac. Se mostrar Apple M1, M2, M3 ou M4, seu Mac é Apple Silicon (ARM). Só instale o Rosetta 2 se algum aplicativo antigo feito para Intel pedir ou se você usar ferramentas antigas pelo Terminal.",
        command: "uname -m",
      },
      {
        title: "3. Configure um backup real com Time Machine",
        body: "Conectar sua conta ao iCloud ajuda a sincronizar arquivos, mas não substitui uma cópia independente. Conecte um SSD ou HD externo dedicado em Ajustes do Sistema → Geral → Time Machine e ative a criptografia do volume de backup.",
      },
      {
        title: "4. Evite 'otimizadores de memória' e use um gerenciador de pacotes confiável",
        body: "O macOS gerencia a memória RAM e o cache automaticamente. Em vez de baixar instaladores de sites desconhecidos, prefira a App Store, o site oficial do desenvolvedor ou o Homebrew para ferramentas de linha de comando e aplicativos verificados.",
        command: "/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"",
        warning: "Antes de executar qualquer script de instalação no Terminal, leia o endereço e confirme que ele aponta para o repositório oficial.",
      },
    ],
    tools: ["filevault", "time-machine", "homebrew", "rectangle", "bitwarden"],
    references: [
      { label: "Suporte da Apple — FileVault", url: "https://support.apple.com/pt-br/guide/mac-help/mh11785/mac" },
      { label: "Suporte da Apple — Time Machine", url: "https://support.apple.com/pt-br/104984" },
      { label: "Homebrew — Documentação oficial", url: "https://docs.brew.sh/" },
    ],
  },
  {
    slug: "instalar-fora-app-store",
    category: "Segurança",
    title: "Como instalar aplicativos fora da App Store com menos risco",
    summary: "Entenda Gatekeeper, notarização, DMG, PKG e os comandos do Terminal para conferir a assinatura de um app.",
    readTime: "5 min",
    audience: "Para quem baixa ferramentas open source ou utilitários pelo navegador",
    steps: [
      {
        title: "1. Confira o domínio e o repositório oficial antes de baixar",
        body: "Anúncios em buscadores frequentemente imitam nomes de projetos populares (como Homebrew, VLC ou OBS). Prefira o link direto do site do projeto ou a página oficial de Releases no GitHub, conferindo o dono do repositório.",
      },
      {
        title: "2. Entenda a diferença entre DMG e PKG",
        body: "Um arquivo DMG funciona como um disco temporário: você arrasta o ícone do app para a pasta Aplicativos e depois ejeta a imagem. Já um arquivo PKG é um instalador com scripts que pode alterar pastas do sistema e pedir senha de administrador.",
        warning: "Tenha atenção extra com arquivos PKG desconhecidos. Eles podem instalar LaunchDaemons e serviços persistentes.",
      },
      {
        title: "3. Verifique assinatura digital e avaliação do Gatekeeper no Terminal",
        body: "O Gatekeeper checa se o aplicativo foi assinado e passou pela notarização da Apple. Você pode inspecionar esses dois pontos pelo Terminal antes mesmo de abrir o programa.",
        command: "spctl --assess --verbose /Applications/NomeDoApp.app && codesign -dv --verbose=2 /Applications/NomeDoApp.app",
      },
      {
        title: "4. Prefira Homebrew Cask para acompanhar atualizações",
        body: "Muitos aplicativos confiáveis de código aberto não pagam conta anual de desenvolvedor da Apple e são distribuídos via Homebrew ou GitHub Releases. Quando estiverem no catálogo oficial do Homebrew Formulae, instalar e atualizar fica rastreável em um comando.",
        command: "brew info --cask rectangle",
      },
    ],
    tools: ["homebrew", "applite", "cork", "knockknock", "blockblock"],
    references: [
      { label: "Suporte da Apple — Abrir apps de desenvolvedor não identificado", url: "https://support.apple.com/pt-br/guide/mac-help/mh40616/mac" },
      { label: "Homebrew Casks — Catálogo oficial", url: "https://formulae.brew.sh/cask/" },
    ],
  },
  {
    slug: "mac-lento-bateria",
    category: "Desempenho",
    title: "Como diagnosticar Mac lento, aquecimento ou bateria acabando rápido",
    summary: "Aprenda a interpretar a Pressão de Memória, identificar processos pesados e revisar itens que iniciam sozinhos.",
    readTime: "6 min",
    audience: "Quando o MacBook esquenta, trava ou perde autonomia sem motivo aparente",
    steps: [
      {
        title: "1. Leia a Pressão de Memória, não apenas a RAM usada",
        body: "Abra o Monitor de Atividade (via Spotlight) e clique na aba Memória. O macOS mantém dados em cache na RAM de propósito. O sinal de aperto real é o gráfico Pressão da Memória ficar amarelo ou vermelho, indicando uso intenso de Swap no SSD.",
      },
      {
        title: "2. Ordene por % CPU e Impacto de Energia",
        body: "Na aba CPU, ordene pela coluna % CPU para descobrir abas de navegador, indexadores ou processos presos em loop. Na aba Energia, observe a coluna Impacto de Energia nas últimas 12 horas para achar quem drena a bateria.",
      },
      {
        title: "3. Inspecione itens de início, LaunchAgents e processos com arquivos abertos",
        body: "Muitos apps instalam agentes em segundo plano que rodam mesmo depois que você fecha a janela. Confira Ajustes do Sistema → Geral → Itens de Início e Extensões, ou inspecione os registros com ferramentas dedicadas.",
        command: "ls -la ~/Library/LaunchAgents /Library/LaunchAgents /Library/LaunchDaemons",
        warning: "Não apague arquivos de LaunchDaemons do sistema sem confirmar a que aplicativo ou driver pertencem.",
      },
      {
        title: "4. Verifique a saúde da bateria antes de instalar limitadores",
        body: "O próprio macOS traz o Carregamento Otimizado em Ajustes do Sistema → Bateria → Saúde da Bateria. Só recorra a utilitários externos como AlDente ou Kombucha se precisar de um limite fixo de carga e após conferir a compatibilidade com seu modelo.",
      },
    ],
    tools: ["monitor-atividade", "stats", "sloth", "ldmanager", "aldente", "keepingyouawake"],
    references: [
      { label: "Guia do Monitor de Atividade — Apple", url: "https://support.apple.com/pt-br/guide/activity-monitor/welcome/mac" },
      { label: "Sobre saúde da bateria no MacBook", url: "https://support.apple.com/pt-br/102589" },
    ],
  },
  {
    slug: "liberar-espaco",
    category: "Armazenamento",
    title: "Como liberar espaço no Mac sem quebrar pastas do sistema",
    summary: "Entenda o que são 'Dados do Sistema', snapshots locais do Time Machine e como limpar com segurança.",
    readTime: "5 min",
    audience: "Para discos quase cheios ou avisos de armazenamento insuficiente",
    steps: [
      {
        title: "1. Comece pelo painel nativo de Armazenamento",
        body: "Vá em Ajustes do Sistema → Geral → Armazenamento para ver o que pesa mais: Aplicativos, Documentos, Arquivos do iOS (backups antigos de iPhone) ou Lixo. Revise downloads antigos e instaladores DMG esquecidos na pasta Downloads.",
      },
      {
        title: "2. Mapeie visualmente suas pastas pessoais",
        body: "Use um analisador visual como GrandPerspective na sua pasta de usuário para localizar vídeos duplicados, pastas de projetos antigos (`node_modules`, builds) ou caches grandes de editores de mídia.",
        warning: "Nunca apague pastas dentro de /System ou arquivos desconhecidos de ~/Library/Application Support sem backup.",
      },
      {
        title: "3. Confira snapshots locais do Time Machine",
        body: "Mesmo quando o disco externo está desconectado, o Time Machine pode guardar snapshots locais no APFS até precisar liberar espaço. Você pode listá-los no Terminal sem apagar nada.",
        command: "tmutil listlocalsnapshots /",
      },
      {
        title: "4. Remova restos de apps desinstalados com revisão manual",
        body: "Arrastar um aplicativo para o Lixo pode deixar arquivos de suporte para trás. Utilitários como AppCleaner e Pearcleaner mostram esses arquivos antes de enviar ao Lixo, permitindo manter preferências caso queira reinstalar depois.",
      },
    ],
    tools: ["armazenamento", "grandperspective", "appcleaner", "pearcleaner", "time-machine-inspector"],
    references: [
      { label: "Liberar espaço no Mac — Suporte da Apple", url: "https://support.apple.com/pt-br/102624" },
    ],
  },
  {
    slug: "backup-sincronizacao",
    category: "Backup",
    title: "Backup de verdade vs Sincronização: por que iCloud Drive não é backup",
    summary: "Saiba por que apagar um arquivo na nuvem pode apagá-lo em todo lugar e como montar uma rotina segura.",
    readTime: "5 min",
    audience: "Para proteger fotos, documentos e código contra falhas, roubo ou exclusão acidental",
    steps: [
      {
        title: "1. Entenda a diferença entre sincronizar e fazer backup",
        body: "Serviços de sincronização (iCloud Drive, Dropbox, Syncthing) espelham o estado atual: se você apagar ou corromper um arquivo no Mac, a alteração costuma ser replicada para os outros aparelhos. Backup guarda cópias separadas no tempo para restauração.",
      },
      {
        title: "2. Aplique a regra 3-2-1 na medida possível",
        body: "Mantenha 3 cópias dos dados importantes: a original no Mac, 1 cópia local em disco externo (como Time Machine) e 1 cópia fora de casa ou criptografada em nuvem (por exemplo com restic ou Cryptomator).",
      },
      {
        title: "3. Teste a restauração pelo menos uma vez",
        body: "Um backup que nunca foi testado é apenas uma suposição. Crie um arquivo de teste, aguarde o backup rodar, apague o arquivo original e confirme que você consegue recuperá-lo pelo Time Machine ou pelo comando de restore.",
        command: "tmutil status",
      },
    ],
    tools: ["time-machine", "restic", "cryptomator", "syncthing", "time-machine-inspector"],
    references: [
      { label: "Fazer backup do Mac com Time Machine", url: "https://support.apple.com/pt-br/104984" },
    ],
  },
  {
    slug: "privacidade-permissoes",
    category: "Privacidade",
    title: "Guia claro das permissões do macOS e do firewall de saída",
    summary: "O que significa conceder Acessibilidade, Gravação de Tela e Acesso Total ao Disco, e como auditar o que está ativo.",
    readTime: "6 min",
    audience: "Para decidir com segurança quais apps devem receber permissões sensíveis",
    steps: [
      {
        title: "1. Acessibilidade e Monitoramento de Entrada",
        body: "Organizadores de janelas (Rectangle, AeroSpace) e remapeadores (Karabiner, LinearMouse) precisam de Acessibilidade para mover janelas ou ler atalhos. Só conceda essa permissão a aplicativos cuja origem você conferiu.",
      },
      {
        title: "2. Gravação de Tela e Áudio do Sistema",
        body: "Mesmo aplicativos de troca de janelas (como AltTab) ou captura (Shottr, Kap, OBS Studio) pedem Gravação de Tela porque precisam ler miniaturas da janela. Lembre-se de que qualquer app com essa permissão pode capturar conteúdo visível na tela.",
      },
      {
        title: "3. Controle conexões de saída e uso de câmera/microfone",
        body: "O firewall nativo do macOS bloqueia principalmente conexões de entrada. Para saber quando um aplicativo tenta enviar dados para a internet, você pode usar o LuLu; e para receber alertas quando webcam ou microfone forem ativados, o OverSight.",
      },
      {
        title: "4. Revise permissões periodicamente em Ajustes do Sistema",
        body: "Abra Ajustes do Sistema → Privacidade e Segurança e passe pelos painéis Câmera, Microfone, Gravação de Tela, Acessibilidade e Acesso Total ao Disco. Desative aplicativos que você não usa mais.",
      },
    ],
    tools: ["lulu", "oversight", "blockblock", "knockknock", "tailscale", "secretive"],
    references: [
      { label: "Controlar o acesso às informações no Mac — Apple", url: "https://support.apple.com/pt-br/guide/mac-help/mchl211c9cd9/mac" },
      { label: "Objective-See — Ferramentas abertas para macOS", url: "https://objective-see.org/products.html" },
    ],
  },
];

export const guidesBySlug = Object.fromEntries(guides.map((guide) => [guide.slug, guide])) as Record<string, Guide | undefined>;
