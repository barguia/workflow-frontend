import dagre from '@dagrejs/dagre'

const ITEMS_POR_LINHA = 10

// O dataset real de mobilidades forma, na prática, uma cadeia quase linear —
// cada tarefa aponta pra uma única próxima e uma única anterior (avanço +
// devolução do mesmo par). Rankear isso com dagre puro (LR) dá um rank por
// tarefa, ou seja, um diagrama de ~60 colunas de largura e 1 nó de altura:
// tecnicamente correto, ilegível na prática. Aqui usamos o rank do dagre só
// pra obter a ORDEM sequencial das tarefas e depois "quebramos" essa ordem
// em uma grade — como um texto que quebra linha — mantendo o layout
// compacto e a sequência ainda visível da esquerda pra direita.
export function calcularLayoutEmGrade(nos, arestas, larguraNo, alturaNo) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR' })

  nos.forEach((no) => g.setNode(no.id, { width: 1, height: 1 }))
  arestas.forEach((aresta) => g.setEdge(aresta.source, aresta.target))

  dagre.layout(g)

  const ordenados = [...nos].sort((a, b) => g.node(a.id).rank - g.node(b.id).rank)

  const colGap = larguraNo * 1.3
  const rowGap = alturaNo * 2.6

  return ordenados.map((no, indice) => {
    const linha = Math.floor(indice / ITEMS_POR_LINHA)
    const posicaoNaLinha = indice % ITEMS_POR_LINHA
    // Serpenteia: linhas pares vão da esquerda pra direita, ímpares ao
    // contrário, assim a tarefa seguinte continua sempre "por perto" da
    // anterior em vez de pular pro extremo oposto a cada quebra de linha.
    const coluna = linha % 2 === 0 ? posicaoNaLinha : ITEMS_POR_LINHA - 1 - posicaoNaLinha
    return {
      ...no,
      position: { x: coluna * colGap, y: linha * rowGap },
    }
  })
}
