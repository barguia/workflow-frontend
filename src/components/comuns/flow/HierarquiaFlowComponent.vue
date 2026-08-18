<script setup>
import { computed, ref } from 'vue'
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
  // [{ id, label, nivel, parentId, ordenacao, cor, estilo, largura, altura }]
  nodes: { type: Array, required: true },
  // [{ id, label, cor, animado, animarCadeiaDuploClique, handles: { source, target } }]
  tiposRelacionamento: { type: Array, default: () => [] },
  // [{ id, origemId, destinoId, tipoId }]
  relacionamentos: { type: Array, default: () => [] },
  // null = mostra relacionamentos de todos os tipos
  tiposVisiveis: { type: Array, default: null },
  nodesDraggable: { type: Boolean, default: false },
  fitViewOnInit: { type: Boolean, default: true },
})

const CORES_PADRAO = {
  container: 'rgba(255, 255, 255, 0.85)',
  folha: 'rgba(226, 232, 240, 0.9)',
  borda: '1px solid rgba(44, 62, 80, 0.3)',
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
        ...(tipo.animarCadeiaDuploClique ? { type: 'transicao-cadeia' } : {}),
      }
    }),
)

// Percurso do "duplo clique": para cada tipo de relacionamento marcado como
// `animarCadeiaDuploClique`, monta um mapa de encadeamento (nodeId -> próximo
// nodeId). Ao dar duplo clique em qualquer node da cadeia, anda pra trás até
// achar o início e anima edge por edge até o fim.
const cadeiasPorTipo = computed(() => {
  const mapa = new Map()

  for (const tipo of props.tiposRelacionamento) {
    if (tipo.animarCadeiaDuploClique) {
      mapa.set(tipo.id, { proximo: new Map(), anterior: new Map(), edgeIdPorPar: new Map() })
    }
  }

  for (const edge of vueFlowEdges.value) {
    const cadeia = mapa.get(edge.data.tipoId)
    if (!cadeia) continue

    cadeia.proximo.set(edge.source, edge.target)
    cadeia.anterior.set(edge.target, edge.source)
    cadeia.edgeIdPorPar.set(`${edge.source}->${edge.target}`, edge.id)
  }

  return mapa
})

const edgeAtivaId = ref(null)
const filaAnimacaoCadeia = ref([])

function avancarFilaAnimacaoCadeia() {
  edgeAtivaId.value = filaAnimacaoCadeia.value.shift() ?? null
}

function iniciarAnimacaoCadeia(nodeId) {
  // Enquanto uma cadeia está tocando, ignora novos duplos cliques. Se o node
  // clicado participar de mais de um tipo animável, usa o primeiro que tiver
  // uma cadeia de fato (ordem de declaração em `tiposRelacionamento`).
  if (edgeAtivaId.value) return

  for (const cadeia of cadeiasPorTipo.value.values()) {
    let inicio = nodeId
    while (cadeia.anterior.has(inicio)) {
      inicio = cadeia.anterior.get(inicio)
    }

    const idsCadeia = []
    let atual = inicio
    while (cadeia.proximo.has(atual)) {
      const proximo = cadeia.proximo.get(atual)
      idsCadeia.push(cadeia.edgeIdPorPar.get(`${atual}->${proximo}`))
      atual = proximo
    }

    if (idsCadeia.length > 0) {
      filaAnimacaoCadeia.value = idsCadeia
      avancarFilaAnimacaoCadeia()
      return
    }
  }
}

const { onNodeDoubleClick } = useVueFlow()

onNodeDoubleClick(({ node }) => {
  iniciarAnimacaoCadeia(node.id)
})
</script>

<template>
  <VueFlow
    :nodes="vueFlowNodes"
    :edges="vueFlowEdges"
    :nodes-draggable="nodesDraggable"
    :fit-view-on-init="fitViewOnInit"
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
