<template>
  <ContainerComponent>
    <CardComponent
      max-width="1400"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — Tipos de Edge (Vue Flow)
      </CardTitleComponent>
      <CardTextComponent>
        <div
          v-if="carregando"
          class="estado-wrapper"
        >
          <ProgressCircularComponent
            indeterminate
            color="primary"
            size="48"
          />
        </div>

        <AlerComponent
          v-else-if="erro"
          type="error"
          variant="tonal"
        >
          {{ erro }}
        </AlerComponent>

        <template v-else>
          <p class="descricao">
            Recorte real do relatório de mobilidade — uma cadeia sequencial de tarefas (avanço),
            com cada trecho renderizado com um tipo de edge diferente, e uma devolução em destaque
            com o edge animado, replicando o exemplo
            <a
              href="https://vueflow.dev/examples/edges/"
              target="_blank"
              rel="noopener"
            >vueflow.dev/examples/edges</a>.
          </p>

          <div class="fluxo-wrapper">
            <VueFlow
              :nodes="nodes"
              :edges="edges"
              :nodes-draggable="true"
              :nodes-connectable="false"
              :edges-updatable="false"
              :min-zoom="0.1"
              fit-view-on-init
              :fit-view-padding="0.25"
            >
              <template #node-tarefa="{ data }">
                <div
                  class="tarefa-node"
                  :class="{ 'tarefa-node--inicial': data.inicial, 'tarefa-node--final': data.final }"
                  :title="`${data.tarefa} — ${data.processo}`"
                >
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
                  <strong>{{ data.tarefa }}</strong>
                  <span class="tarefa-node__processo">{{ data.processo }}</span>
                  <small v-if="data.inicial">início</small>
                </div>
              </template>

              <template #edge-rotuloEstilizado="edgeProps">
                <MobilidadeEdgeRotulo v-bind="edgeProps" />
              </template>

              <template #edge-animado="edgeProps">
                <MobilidadeEdgeAnimado v-bind="edgeProps" />
              </template>

              <Background
                pattern-color="#aaa"
                :gap="16"
              />
              <MiniMap
                pannable
                zoomable
              />
              <Controls />
            </VueFlow>
          </div>
        </template>
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { VueFlow, Handle, Position, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import MobilidadeEdgeRotulo from './MobilidadeEdgeRotulo.vue'
import MobilidadeEdgeAnimado from './MobilidadeEdgeAnimado.vue'
import { useMobilidadesRelatorio, MOBILIDADE_TIPO } from './data/mobilidadesRelatorioService.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'
const COR_ROTULO = '#7C3AED'
const NUM_NOS = 7
const NODE_GAP_X = 260
const ARCO_OFFSET = 34
const INDICE_PAR_DEVOLUCAO = 2

// Cada trecho da cadeia real usa um tipo de edge diferente do Vue Flow —
// os quatro tipos nativos (bezier/default, smoothstep, step, straight) mais
// um edge com label embutido e um edge customizado com badge estilizado.
const TIPOS_EDGE = [
  { tipo: 'default', rotulo: 'BEZIER EDGE (PADRÃO)' },
  { tipo: 'smoothstep', rotulo: 'SMOOTHSTEP EDGE' },
  { tipo: 'step', rotulo: 'STEP EDGE' },
  { tipo: 'straight', rotulo: 'STRAIGHT EDGE' },
  { tipo: 'default', rotulo: 'LABEL ONLY EDGE' },
  { tipo: 'rotuloEstilizado', rotulo: 'CUSTOM LABEL EDGE' },
]

const { buscarMobilidades } = useMobilidadesRelatorio()

const carregando = ref(true)
const erro = ref(null)
const nodes = ref([])
const edges = ref([])

// A cadeia real de mobilidades é, na prática, quase linear (cada tarefa tem
// um único avanço seguinte) — em vez de forçar uma árvore artificial como no
// exemplo estático do Vue Flow, percorremos essa cadeia a partir da tarefa
// raiz (sem avanço recebido) e aplicamos um tipo de edge por trecho.
function montarCadeia(tarefas, mobilidades) {
  const avancoPorOrigem = new Map()
  const devolucaoPorPar = new Map()
  const destinosAvanco = new Set()

  mobilidades.forEach((mobilidade) => {
    if (mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO) {
      if (!avancoPorOrigem.has(mobilidade.origemId)) {
        avancoPorOrigem.set(mobilidade.origemId, mobilidade)
      }
      destinosAvanco.add(mobilidade.destinoId)
    } else {
      devolucaoPorPar.set(`${mobilidade.destinoId}-${mobilidade.origemId}`, mobilidade)
    }
  })

  const raiz = tarefas.find((tarefa) => avancoPorOrigem.has(tarefa.id) && !destinosAvanco.has(tarefa.id))
    ?? tarefas[0]

  const cadeiaIds = [raiz.id]
  let atual = raiz.id
  while (cadeiaIds.length < NUM_NOS) {
    const proximo = avancoPorOrigem.get(atual)
    if (!proximo) break
    atual = proximo.destinoId
    cadeiaIds.push(atual)
  }

  return { cadeiaIds, avancoPorOrigem, devolucaoPorPar }
}

onMounted(async () => {
  try {
    const { tarefas, mobilidades } = await buscarMobilidades()
    const tarefaPorId = new Map(tarefas.map((tarefa) => [tarefa.id, tarefa]))
    const { cadeiaIds, avancoPorOrigem, devolucaoPorPar } = montarCadeia(tarefas, mobilidades)

    nodes.value = cadeiaIds.map((id, indice) => {
      const tarefa = tarefaPorId.get(id)
      return {
        id: String(id),
        type: 'tarefa',
        position: { x: indice * NODE_GAP_X, y: 160 },
        data: {
          tarefa: tarefa?.tarefa ?? String(id),
          processo: tarefa?.processo ?? '',
          inicial: indice === 0,
        },
      }
    })

    const edgesMontadas = []

    for (let indice = 0; indice < cadeiaIds.length - 1; indice++) {
      const origemId = cadeiaIds[indice]
      const destinoId = cadeiaIds[indice + 1]
      const mobilidade = avancoPorOrigem.get(origemId)
      if (!mobilidade) continue

      const config = TIPOS_EDGE[indice % TIPOS_EDGE.length]
      const mostraLabelPadrao = config.tipo !== 'rotuloEstilizado'

      edgesMontadas.push({
        id: `mob-${mobilidade.id}`,
        type: config.tipo,
        source: String(origemId),
        target: String(destinoId),
        sourceHandle: 'top-source',
        targetHandle: 'top-target',
        label: mostraLabelPadrao ? config.rotulo : undefined,
        labelShowBg: false,
        labelStyle: { fill: '#64748B', fontSize: '10px', fontWeight: 600 },
        data: { rotulo: config.rotulo },
        style: { stroke: config.tipo === 'rotuloEstilizado' ? COR_ROTULO : COR_AVANCO, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: config.tipo === 'rotuloEstilizado' ? COR_ROTULO : COR_AVANCO,
          width: 16,
          height: 16,
        },
      })
    }

    // Destaca UMA devolução real do par escolhido com o edge animado
    // tracejado, arqueando por baixo da cadeia (handles bottom).
    if (cadeiaIds.length > INDICE_PAR_DEVOLUCAO + 1) {
      const origemId = cadeiaIds[INDICE_PAR_DEVOLUCAO]
      const destinoId = cadeiaIds[INDICE_PAR_DEVOLUCAO + 1]
      const devolucao = devolucaoPorPar.get(`${origemId}-${destinoId}`)

      if (devolucao) {
        edgesMontadas.push({
          id: `mob-${devolucao.id}`,
          type: 'animado',
          source: String(destinoId),
          target: String(origemId),
          sourceHandle: 'bottom-source',
          targetHandle: 'bottom-target',
          data: { rotulo: 'ANIMATED EDGE (DEVOLUÇÃO)', offset: -ARCO_OFFSET },
          style: { stroke: COR_DEVOLUCAO, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: COR_DEVOLUCAO, width: 16, height: 16 },
        })
      }
    }

    edges.value = edgesMontadas
  } catch (erroCapturado) {
    erro.value = erroCapturado.message || 'Não foi possível carregar as mobilidades do relatório.'
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.estado-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.descricao {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface), 0.7);
  margin-bottom: 16px;
}

.fluxo-wrapper {
  height: 65vh;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}

.tarefa-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 180px;
  height: 56px;
  padding: 4px 10px;
  border-radius: 10px;
  background: #fff;
  border: 2px solid #4A6CF7;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tarefa-node--inicial {
  border-color: #10B981;
}

.tarefa-node strong {
  font-size: 12px;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tarefa-node__processo {
  font-size: 9px;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tarefa-node small {
  font-size: 9px;
  color: #10B981;
  text-transform: uppercase;
}

.tarefa-node :deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
