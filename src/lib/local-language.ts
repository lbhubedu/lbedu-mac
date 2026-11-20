// A small, transparent nearest-neighbor classifier trained on labeled task examples.
// It runs without services or model downloads and abstains on close or weak matches.
const stop = new Set("a ao aos as o os um uma uns umas eu meu minha dele dela no nos na nas em e ou que se com de da do das dos para pelo pela me quero preciso gostaria como consigo ajuda ajuda-me posso fazer mac macbook macos notebook laptop computador app aplicativos programa alguma algum muito mais menos toda todo isso esse esta sem nao vez agora duas dois apenas nada".split(" "));
const groups = [
  "disco ssd hdd", "espaco capacidade", "cheio cheia lotado lotada lotou lotaram estourado estourou", "arquivo arquivos documento documentos",
  "mandar enviar passe passar transferir transmitir", "organizar arrumar colocar alinhar encaixar posicionar dispor", "janela janelas", "celular telefone smartphone",
  "excluir deletar apagar remover", "profissional avancado", "trava travar travou travando congelando congelou lento lentidao", "copiar salvar guardar", "capturar captura capturo",
  "baixar instalacao instalar instalo", "rodar roda executar executo", "rede wifi conexao", "nota notas anotacao anotacoes", "senha senhas credencial credenciais",
  "proteger segurar protecao", "diminuir reduzir menor reduziram", "converter conversao transformar", "mudar trocar alterar mudar", "gravar gravacao registrar",
];
const root = new Map(groups.flatMap((group) => { const [key, ...variants] = group.split(" "); return [key, ...variants].map((variant) => [variant, key] as const); }));
const tokens = (value: string) => [...new Set(value.replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((word) => word.length > 2 && !stop.has(word) && !/^\d+$/.test(word)).map((word) => root.get(word) ?? word.replace(/oes$/, "ao").replace(/([aeo])s$/, "$1")))];

function features(words: string[]) {
  const out = new Map<string, number>();
  for (const word of words) {
    out.set(`w:${word}`, 1);
    if (word.length < 4) continue;
    const padded = `_${word}_`;
    for (let i = 0; i <= padded.length - 3; i++) out.set(`c:${padded.slice(i, i + 3)}`, 0.21);
  }
  return out;
}

type TaskExamples = { id: string; examples: string[] };
export function trainTaskClassifier(tasks: TaskExamples[]) {
  const training = tasks.flatMap(({ id, examples }) => examples.map((text) => ({ id, words: tokens(text) }))).filter(({ words }) => words.length >= 2).map((item) => ({ ...item, features: features(item.words) }));
  const counts = new Map<string, number>();
  for (const item of training) for (const key of item.features.keys()) counts.set(key, (counts.get(key) ?? 0) + 1);
  const weight = (key: string) => 1 + Math.log((1 + training.length) / (1 + (counts.get(key) ?? 0)));
  function vector(input: Map<string, number>) {
    const entries = [...input.entries()].map(([key, score]) => [key, score * weight(key)] as const);
    const length = Math.hypot(...entries.map(([, value]) => value)) || 1;
    return new Map(entries.map(([key, value]) => [key, value / length]));
  }
  const trained = training.map(({ id, words, features }) => ({ id, words, basis: vector(features) }));
  return (input: string): string | null => {
    const words = tokens(input);
    if (words.length < 2) return null;
    const wordSet = new Set(words);
    const basis = vector(features(words));
    const scores = new Map<string, number>();
    for (const item of trained) {
      if (item.words.filter((word) => wordSet.has(word)).length < 2) continue;
      let fit = 0;
      for (const [key, value] of item.basis) fit += value * (basis.get(key) ?? 0);
      if (fit > 0.53 && fit > (scores.get(item.id) ?? 0)) scores.set(item.id, fit);
    }
    const [first, second] = Array.from(scores).sort((a, b) => b[1] - a[1]);
    return first && first[1] - (second?.[1] ?? 0) >= 0.07 ? first[0] : null;
  };
}
