<script setup>
import { computed, ref, watch } from 'vue'
import { Handle, Position, VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import HierarquiaTransitionEdgeComponent from './HierarquiaTransitionEdgeComponent.vue'
import { calcularLayoutHierarquico } from './useHierarquiaFlowLayout.js'

defineOptions({ name: 'HierarquiaFlowComponent' })

const props = defineProps({
  // [{ nivel, nivelPai, orientacao, espacamentoIrmaos, paddingConteudo, largura, altura,
  //   textoMaiusculo, textoCentralizado }] — os dois últimos controlam o
  //   estilo do texto do node (texto em uppercase e centralizado); ambos
  //   default `true` (ver normalizarHierarquia em useHierarquiaFlowLayout.js).
  hierarquias: { type: Array, required: true },
  // [{ id, label, nivel, parentId, ordenacao, cor, estilo, largura, altura,
  //   inicial, final }] — `inicial`/`final` marcam o node como início/fim de
  //   um fluxo; são o gatilho de "animar cadeia no duplo clique" (ver
  //   `iniciarAnimacaoCadeia` abaixo).
  nodes: { type: Array, required: true },
  // [{ id, label, cor, animado, handles: { source, target } }]
  tiposRelacionamento: { type: Array, default: () => [] },
  // [{ id, origemId, destinoId, tipoId }]
  relacionamentos: { type: Array, default: () => [] },
  // null = mostra relacionamentos de todos os tipos
  tiposVisiveis: { type: Array, default: null },
  nodesDraggable: { type: Boolean, default: false },
  fitViewOnInit: { type: Boolean, default: true },
})

// Sempre via variável CSS do tema (`rgb(var(--v-theme-X))`), nunca hex fixo —
// assim os nodes acompanham automaticamente qualquer um dos temas do projeto.
const CORES_PADRAO = {
  container: 'rgba(var(--v-theme-surface), 0.85)',
  folha: 'rgb(var(--v-theme-background))',
  borda: '1px solid rgba(var(--v-theme-on-surface), 0.3)',
}

const layout = computed(() => calcularLayoutHierarquico({ hierarquias: props.hierarquias, nodes: props.nodes }))

const vueFlowNodes = computed(() => {
  const { definicoes, tamanhos, posicoes, ordemRenderizacao } = layout.value
  const nodesPorId = new Map(props.nodes.map((node) => [String(node.id), node]))

  return ordemRenderizacao.map((id) => {
    const node = nodesPorId.get(id)
    const definicao = definicoes.get(node.nivel)
    const tamanho = tamanhos.get(id)
    const parentId = node.parentId == null ? null : String(node.parentId)
    const ehFolha = definicao?.ehFolha ?? true

    return {
      id,
      type: 'no-hierarquia',
      data: { label: node.label, nivel: node.nivel, ehFolha, origem: node },
      position: posicoes.get(id) ?? { x: 0, y: 0 },
      ...(parentId ? { parentNode: parentId, extent: 'parent' } : {}),
      style: {
        width: `${tamanho?.largura ?? 0}px`,
        height: `${tamanho?.altura ?? 0}px`,
        backgroundColor: node.cor ?? (ehFolha ? CORES_PADRAO.folha : CORES_PADRAO.container),
        border: CORES_PADRAO.borda,
        ...((definicao?.textoMaiusculo ?? true) ? { textTransform: 'uppercase' } : {}),
        ...((definicao?.textoCentralizado ?? true) ? { textAlign: 'center' } : {}),
        ...(ehFolha
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 6px',
              fontSize: '9px',
              lineHeight: '1.2',
            }
          : { padding: '8px 10px', fontSize: '11px', lineHeight: '1.25' }),
        ...(node.estilo ?? {}),
      },
    }
  })
})

const tiposPorId = computed(() => new Map(props.tiposRelacionamento.map((tipo) => [tipo.id, tipo])))

const vueFlowEdges = computed(() =>
  props.relacionamentos
    .filter((relacionamento) => !props.tiposVisiveis || props.tiposVisiveis.includes(relacionamento.tipoId))
    .map((relacionamento, indice) => {
      const tipo = tiposPorId.value.get(relacionamento.tipoId) ?? {}
      const handles = tipo.handles

      return {
        id: relacionamento.id != null ? String(relacionamento.id) : `rel-${indice}`,
        source: String(relacionamento.origemId),
        target: String(relacionamento.destinoId),
        ...(handles
          ? { sourceHandle: `${handles.source}-source`, targetHandle: `${handles.target}-target` }
          : {}),
        animated: tipo.animado ?? false,
        data: { tipoId: relacionamento.tipoId },
        ...(tipo.cor ? { style: { stroke: tipo.cor } } : {}),
        type: 'transicao-cadeia',
      }
    }),
)

// Percurso do "duplo clique": um mapa de encadeamento por tipo de
// relacionamento (nodeId -> próximo nodeId), só com os tipos atualmente
// visíveis (`vueFlowEdges` já vem filtrado por `tiposVisiveis`). O duplo
// clique só dispara em nodes de início/fim de fluxo (`origem.inicial`/
// `origem.final`) — esses nodes já SÃO o início da própria cadeia (em
// qualquer direção: uma cadeia de devolução, por exemplo, tem `source` no
// node final e caminha até o inicial), então não precisa procurar o início
// andando pra trás — só anda pra frente a partir do node clicado, usando o
// primeiro tipo visível que tiver uma cadeia de fato a partir dele.
const cadeiasPorTipo = computed(() => {
  const mapa = new Map()

  for (const edge of vueFlowEdges.value) {
    const cadeia = mapa.get(edge.data.tipoId) ?? { proximo: new Map(), edgeIdPorPar: new Map() }
    cadeia.proximo.set(edge.source, edge.target)
    cadeia.edgeIdPorPar.set(`${edge.source}->${edge.target}`, edge.id)
    mapa.set(edge.data.tipoId, cadeia)
  }

  return mapa
})

const edgeAtivaId = ref(null)
const filaAnimacaoCadeia = ref([])

function avancarFilaAnimacaoCadeia() {
  edgeAtivaId.value = filaAnimacaoCadeia.value.shift() ?? null
}

function iniciarAnimacaoCadeia(nodeId, { ehInicial, ehFinal }) {
  if (edgeAtivaId.value) return
  if (!ehInicial && !ehFinal) return

  for (const cadeia of cadeiasPorTipo.value.values()) {
    if (!cadeia.proximo.has(nodeId)) continue

    // `visitados` corta o percurso assim que reencontra um node já
    // passado — dados reais de devolução podem formar ciclos (ex: A devolve
    // pra B e B devolve de volta pra A), e sem esse corte o `while` andaria
    // pra sempre, estourando o tamanho máximo de array (RangeError).
    const idsCadeia = []
    const visitados = new Set([nodeId])
    let atual = nodeId
    while (cadeia.proximo.has(atual)) {
      const proximo = cadeia.proximo.get(atual)
      if (visitados.has(proximo)) break

      idsCadeia.push(cadeia.edgeIdPorPar.get(`${atual}->${proximo}`))
      visitados.add(proximo)
      atual = proximo
    }

    if (idsCadeia.length > 0) {
      filaAnimacaoCadeia.value = idsCadeia
      avancarFilaAnimacaoCadeia()
      return
    }
  }
}

const { onNodeDoubleClick, findNode, setCenter } = useVueFlow()

onNodeDoubleClick(({ node }) => {
  iniciarAnimacaoCadeia(node.id, { ehInicial: !!node.data?.origem?.inicial, ehFinal: !!node.data?.origem?.final })
})

// Zoom fixo pra câmera de acompanhamento — usar `fitBounds` (enquadra pelos
// dois nodes da edge) fazia o zoom oscilar a cada passo da cadeia, dando
// zoom out sozinho sempre que dois nodes ficavam mais distantes entre si.
// Com `setCenter` + zoom fixo, só a posição muda: o zoom escolhido pro
// primeiro passo se mantém constante até o fim da cadeia.
const ZOOM_ANIMACAO = 2

// Acompanha a animação da cadeia: a cada edge que entra em `tocando`, a
// câmera centraliza no meio dela (origem + destino) em vez de deixar o
// usuário procurar a animação num diagrama grande.
watch(edgeAtivaId, (id) => {
  if (!id) return

  const edge = vueFlowEdges.value.find((edge) => edge.id === id)
  const origem = edge && findNode(edge.source)
  const destino = edge && findNode(edge.target)
  if (!origem?.dimensions?.width || !destino?.dimensions?.width) return

  const centroOrigemX = origem.computedPosition.x + origem.dimensions.width / 2
  const centroOrigemY = origem.computedPosition.y + origem.dimensions.height / 2
  const centroDestinoX = destino.computedPosition.x + destino.dimensions.width / 2
  const centroDestinoY = destino.computedPosition.y + destino.dimensions.height / 2

  setCenter((centroOrigemX + centroDestinoX) / 2, (centroOrigemY + centroDestinoY) / 2, {
    zoom: ZOOM_ANIMACAO,
    duration: 500,
  })
})
</script>

<template>
  <VueFlow
    :nodes="vueFlowNodes"
    :edges="vueFlowEdges"
    :nodes-draggable="nodesDraggable"
    :fit-view-on-init="fitViewOnInit"
    :max-zoom="4"
    elevate-edges-on-select
    class="hierarquia-flow-component"
  >
    <template #node-no-hierarquia="{ data }">
      <Handle
        id="top-target"
        type="target"
        :position="Position.Top"
      />
      <Handle
        id="top-source"
        type="source"
        :position="Position.Top"
      />
      <Handle
        id="bottom-target"
        type="target"
        :position="Position.Bottom"
      />
      <Handle
        id="bottom-source"
        type="source"
        :position="Position.Bottom"
      />
      <Handle
        id="left-target"
        type="target"
        :position="Position.Left"
      />
      <Handle
        id="left-source"
        type="source"
        :position="Position.Left"
      />
      <Handle
        id="right-target"
        type="target"
        :position="Position.Right"
      />
      <Handle
        id="right-source"
        type="source"
        :position="Position.Right"
      />

      <slot
        :name="`node-${data.nivel}`"
        v-bind="data"
      >
        {{ data.label }}
      </slot>
    </template>

    <template #edge-transicao-cadeia="edgeProps">
      <HierarquiaTransitionEdgeComponent
        v-bind="edgeProps"
        :tocando="edgeAtivaId === edgeProps.id"
        @concluido="avancarFilaAnimacaoCadeia"
      />
    </template>

    <slot />
  </VueFlow>
</template>

<style scoped>
.hierarquia-flow-component {
  width: 100%;
  height: 100%;
}

.hierarquia-flow-component :deep(.vue-flow__node-no-hierarquia .vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
