<template>
  <ContainerComponent>
    <CardComponent
      max-width="1400"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — Vue Flow (dataset nomeado completo, {{ tarefas.length }} tarefas)
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
          <div class="controles">
            <div class="legenda">
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--avanco" />
                Avanço
              </span>
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--devolucao" />
                Devolução
              </span>
              <span
                v-for="macroprocesso in macroprocessos"
                :key="macroprocesso"
                class="legenda__item"
              >
                <span
                  class="legenda__bolinha"
                  :style="{ borderColor: corPorMacroprocesso(macroprocesso) }"
                />
                {{ macroprocesso }}
              </span>
            </div>

            <CheckboxComponent
              v-model="tiposVisiveis"
              :items="tipoItems"
              inline
            />
          </div>

          <div class="fluxo-wrapper">
            <VueFlow
              :nodes="nodes"
              :edges="edgesVisiveis"
              :nodes-draggable="true"
              :nodes-connectable="false"
              :edges-updatable="false"
              :min-zoom="0.1"
              fit-view-on-init
            >
              <template #node-tarefa="{ data }">
                <div
                  class="tarefa-node"
                  :style="{ borderColor: data.cor }"
                  :title="`${data.tarefa} — ${data.processo} (${data.macroprocesso})`"
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
                </div>
              </template>

              <template #edge-mobilidade="edgeProps">
                <MobilidadeEdgeCurva v-bind="edgeProps" />
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
import { computed, onMounted, ref } from 'vue'
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
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import MobilidadeEdgeCurva from './MobilidadeEdgeCurva.vue'
import { useMobilidadesRelatorio, MOBILIDADE_TIPO } from './data/mobilidadesRelatorioService.js'
import { calcularLayoutEmGrade } from './data/vueFlowLayout.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'
const NODE_WIDTH = 180
const NODE_HEIGHT = 56
const CURVATURA_OFFSET = 28

const CORES_MACROPROCESSO = {
  Iniciação: '#8B5CF6',
  Planejamento: '#F59E0B',
  Execução: '#10B981',
  'Monitoramento e Controle': '#06B6D4',
  Encerramento: '#EC4899',
}
const corPorMacroprocesso = (macroprocesso) => CORES_MACROPROCESSO[macroprocesso] ?? '#4A6CF7'

const tipoItems = [
  { text: 'Avanço', value: MOBILIDADE_TIPO.AVANCO },
  { text: 'Devolução', value: MOBILIDADE_TIPO.DEVOLUCAO },
]
const tiposVisiveis = ref([MOBILIDADE_TIPO.AVANCO, MOBILIDADE_TIPO.DEVOLUCAO])

const { buscarMobilidades } = useMobilidadesRelatorio()

const carregando = ref(true)
const erro = ref(null)
const tarefas = ref([])
const macroprocessos = ref([])
const nodes = ref([])
const edgesBase = ref([])

onMounted(async () => {
  try {
    const { tarefas: tarefasApi, mobilidades } = await buscarMobilidades()
    tarefas.value = tarefasApi
    macroprocessos.value = [...new Set(tarefasApi.map((tarefa) => tarefa.macroprocesso))]

    const nodesBase = tarefasApi.map((tarefa) => ({
      id: String(tarefa.id),
      type: 'tarefa',
      position: { x: 0, y: 0 },
      data: {
        tarefa: tarefa.tarefa,
        processo: tarefa.processo,
        macroprocesso: tarefa.macroprocesso,
        cor: corPorMacroprocesso(tarefa.macroprocesso),
      },
    }))

    edgesBase.value = mobilidades.map((mobilidade) => {
      const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
      const cor = avanco ? COR_AVANCO : COR_DEVOLUCAO

      return {
        id: `mob-${mobilidade.id}`,
        type: 'mobilidade',
        tipoId: mobilidade.tipoId,
        source: String(mobilidade.origemId),
        target: String(mobilidade.destinoId),
        sourceHandle: avanco ? 'top-source' : 'bottom-source',
        targetHandle: avanco ? 'top-target' : 'bottom-target',
        data: { offset: avanco ? CURVATURA_OFFSET : -CURVATURA_OFFSET },
        style: { stroke: cor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: cor, width: 14, height: 14 },
      }
    })

    nodes.value = calcularLayoutEmGrade(nodesBase, edgesBase.value, NODE_WIDTH, NODE_HEIGHT)
  } catch (erroCapturado) {
    erro.value = erroCapturado.message || 'Não foi possível carregar as mobilidades do relatório.'
  } finally {
    carregando.value = false
  }
})

const edgesVisiveis = computed(() =>
  edgesBase.value.filter((edge) => tiposVisiveis.value.includes(edge.tipoId))
)
</script>

<style scoped>
.estado-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.controles {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legenda__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legenda__linha {
  width: 28px;
  height: 3px;
  border-radius: 2px;
  display: inline-block;
}

.legenda__linha--avanco {
  background: #3B82F6;
}

.legenda__linha--devolucao {
  background: #EF4444;
}

.legenda__bolinha {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid;
  background: #fff;
  display: inline-block;
}

.fluxo-wrapper {
  height: 75vh;
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

.tarefa-node :deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
