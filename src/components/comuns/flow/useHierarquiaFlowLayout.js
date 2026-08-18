// Algoritmo de layout para hierarquias aninhadas (N níveis) do
// HierarquiaFlowComponent. Puro (sem Vue), em duas passadas:
//   1. bottom-up: calcula o tamanho de cada node a partir dos filhos
//   2. top-down: posiciona cada node relativo ao seu parent
//
// Assume uma hierarquia linear (cada nível tem no máximo um nível filho,
// via `nivelPai`) — é o que cobre o caso de uso atual (grupo > processo >
// tarefa). Suportar múltiplos tipos de filho sob o mesmo parent fica para
// uma v2 (ou para a versão baseada em elkjs).

const PADDING_CONTEUDO_PADRAO = { topo: 50, fundo: 20, lateral: 20 }
const ESPACAMENTO_IRMAOS_PADRAO = 20
const TAMANHO_MINIMO = 40

function normalizarHierarquia(hierarquias) {
  const definicoes = new Map()

  for (const definicaoBruta of hierarquias) {
    definicoes.set(definicaoBruta.nivel, {
      nivel: definicaoBruta.nivel,
      nivelPai: definicaoBruta.nivelPai ?? null,
      orientacao: definicaoBruta.orientacao ?? 'horizontal',
      espacamentoIrmaos: definicaoBruta.espacamentoIrmaos ?? ESPACAMENTO_IRMAOS_PADRAO,
      paddingConteudo: { ...PADDING_CONTEUDO_PADRAO, ...(definicaoBruta.paddingConteudo ?? {}) },
      largura: definicaoBruta.largura,
      altura: definicaoBruta.altura,
    })
  }

  const niveisComFilhos = new Set(
    [...definicoes.values()].filter((definicao) => definicao.nivelPai != null).map((definicao) => definicao.nivelPai),
  )

  for (const definicao of definicoes.values()) {
    definicao.ehFolha = !niveisComFilhos.has(definicao.nivel)
  }

  return definicoes
}

export function calcularLayoutHierarquico({ hierarquias, nodes }) {
  const definicoes = normalizarHierarquia(hierarquias)
  const nodesPorId = new Map(nodes.map((node) => [String(node.id), node]))

  const filhosPorParentId = new Map()
  const idsRaiz = []

  nodes.forEach((node) => {
    const id = String(node.id)
    const parentId = node.parentId == null ? null : String(node.parentId)

    if (parentId == null) {
      idsRaiz.push(id)
      return
    }

    const lista = filhosPorParentId.get(parentId) ?? []
    lista.push(id)
    filhosPorParentId.set(parentId, lista)
  })

  const tamanhos = new Map()
  const posicoes = new Map()

  function ordenarPorOrdenacao(idsFilhos) {
    return idsFilhos
      .map((id, indice) => ({ id, indice }))
      .sort((a, b) => {
        const ordA = nodesPorId.get(a.id).ordenacao ?? a.indice
        const ordB = nodesPorId.get(b.id).ordenacao ?? b.indice
        return ordA - ordB
      })
      .map(({ id }) => id)
  }

  // Passo 1 — bottom-up: tamanho de cada node.
  function calcularTamanho(id) {
    const node = nodesPorId.get(id)
    const definicao = definicoes.get(node.nivel)
    const idsFilhosBrutos = filhosPorParentId.get(id) ?? []

    if (definicao.ehFolha || idsFilhosBrutos.length === 0) {
      const tamanho = {
        largura: node.largura ?? definicao.largura ?? TAMANHO_MINIMO,
        altura: node.altura ?? definicao.altura ?? TAMANHO_MINIMO,
      }
      tamanhos.set(id, tamanho)
      return tamanho
    }

    const idsFilhos = ordenarPorOrdenacao(idsFilhosBrutos)
    const tamanhosFilhos = idsFilhos.map(calcularTamanho)
    const definicaoFilho = definicoes.get(nodesPorId.get(idsFilhos[0]).nivel)
    const { topo, fundo, lateral } = definicao.paddingConteudo
    const gap = definicaoFilho.espacamentoIrmaos * Math.max(0, idsFilhos.length - 1)

    const tamanho =
      definicaoFilho.orientacao === 'vertical'
        ? {
            largura: lateral * 2 + Math.max(...tamanhosFilhos.map((t) => t.largura)),
            altura: topo + tamanhosFilhos.reduce((soma, t) => soma + t.altura, 0) + gap + fundo,
          }
        : {
            largura: lateral * 2 + tamanhosFilhos.reduce((soma, t) => soma + t.largura, 0) + gap,
            altura: topo + Math.max(...tamanhosFilhos.map((t) => t.altura)) + fundo,
          }

    tamanhos.set(id, tamanho)
    return tamanho
  }

  // Passo 2 — top-down: posição de cada node relativa ao parent. A ordem em
  // que os ids são visitados aqui (parent sempre antes dos filhos) é a mesma
  // exigida pelo Vue Flow para renderizar nodes aninhados corretamente.
  const ordemRenderizacao = []

  function posicionarIrmaos(idsIrmaos, definicaoIrmaos, xConteudo, yConteudo) {
    let cursor = definicaoIrmaos.orientacao === 'vertical' ? yConteudo : xConteudo

    for (const id of idsIrmaos) {
      const tamanho = tamanhos.get(id)
      const posicao =
        definicaoIrmaos.orientacao === 'vertical' ? { x: xConteudo, y: cursor } : { x: cursor, y: yConteudo }
      posicoes.set(id, posicao)
      ordemRenderizacao.push(id)

      cursor +=
        (definicaoIrmaos.orientacao === 'vertical' ? tamanho.altura : tamanho.largura) +
        definicaoIrmaos.espacamentoIrmaos

      const node = nodesPorId.get(id)
      const definicao = definicoes.get(node.nivel)
      const idsFilhosBrutos = filhosPorParentId.get(id) ?? []

      // Mesma condição de `calcularTamanho`: se o node é folha pela
      // hierarquia declarada, seus filhos (se houver, por inconsistência de
      // dados) não tiveram tamanho calculado e não podem ser posicionados.
      if (!definicao.ehFolha && idsFilhosBrutos.length > 0) {
        const idsFilhos = ordenarPorOrdenacao(idsFilhosBrutos)
        const definicaoFilho = definicoes.get(nodesPorId.get(idsFilhos[0]).nivel)
        posicionarIrmaos(idsFilhos, definicaoFilho, definicao.paddingConteudo.lateral, definicao.paddingConteudo.topo)
      }
    }
  }

  const idsRaizOrdenados = ordenarPorOrdenacao(idsRaiz)
  idsRaizOrdenados.forEach(calcularTamanho)

  if (idsRaizOrdenados.length > 0) {
    const definicaoRaiz = definicoes.get(nodesPorId.get(idsRaizOrdenados[0]).nivel)
    posicionarIrmaos(idsRaizOrdenados, definicaoRaiz, 0, 0)
  }

  return { definicoes, tamanhos, posicoes, ordemRenderizacao }
}
