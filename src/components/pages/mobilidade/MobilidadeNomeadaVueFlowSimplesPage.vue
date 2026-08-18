<template>
  <ContainerComponent>
    <CardComponent
      max-width="1200"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — Vue Flow (exemplo simples, dados nomeados)
      </CardTitleComponent>
      <CardTextComponent>
        <div class="legenda">
          <span class="legenda__item">
            <span class="legenda__linha legenda__linha--avanco" />
            Avanço
          </span>
          <span class="legenda__item">
            <span class="legenda__linha legenda__linha--devolucao" />
            Devolução
          </span>
        </div>

        <div class="fluxo-wrapper">
          <VueFlow
            :nodes="nodes"
            :edges="edges"
            :nodes-draggable="false"
            :nodes-connectable="false"
            :edges-updatable="false"
            :elements-selectable="false"
            :zoom-on-scroll="false"
            :zoom-on-pinch="false"
            fit-view-on-init
            :fit-view-padding="0.2"
          >
            <template #node-tarefa="{ data }">
              <div
                class="tarefa-node"
                :class="{ 'tarefa-node--inicial': data.inicial, 'tarefa-node--final': data.final }"
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
                <small v-if="data.final">fim</small>
              </div>
            </template>
          </VueFlow>
        </div>
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { VueFlow, Handle, Position, MarkerType } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import { listarMobilidades, listarTarefas, MOBILIDADE_TIPO } from './data/normalizarMobilidadesNomeadas.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'

// Recorte simples do dataset completo: a cadeia linear de "Identificação da
// Demanda" (registrar → descrever → definir objetivo → classificar tipo),
// equivalente ao A → B → C → D do MobilidadeExemploPage, mas com nomes reais.
const IDS_TAREFAS_EXIBIDAS = [54, 26, 23, 15]

const tarefas = listarTarefas()
const tarefaPorId = new Map(tarefas.map((tarefa) => [tarefa.id, tarefa]))

const nodes = IDS_TAREFAS_EXIBIDAS.map((id, indice) => {
  const tarefa = tarefaPorId.get(id)
  return {
    id: String(id),
    type: 'tarefa',
    position: { x: indice * 300, y: 160 },
    data: {
      tarefa: tarefa.tarefa,
      processo: tarefa.processo,
      inicial: indice === 0,
      final: indice === IDS_TAREFAS_EXIBIDAS.length - 1,
    },
  }
})

const mobilidades = listarMobilidades().filter(
  (mobilidade) =>
    IDS_TAREFAS_EXIBIDAS.includes(mobilidade.origemId) &&
    IDS_TAREFAS_EXIBIDAS.includes(mobilidade.destinoId)
)

// Mesmo truque de handles top/bottom do MobilidadeExemploPage: avanço usa o
// arco por cima, devolução o arco por baixo, evitando sobreposição entre as
// duas arestas do mesmo par de tarefas.
const edges = mobilidades.map((mobilidade) => {
  const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
  const cor = avanco ? COR_AVANCO : COR_DEVOLUCAO

  return {
    id: `mob-${mobilidade.id}`,
    source: String(mobilidade.origemId),
    target: String(mobilidade.destinoId),
    sourceHandle: avanco ? 'top-source' : 'bottom-source',
    targetHandle: avanco ? 'top-target' : 'bottom-target',
    style: { stroke: cor, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: cor, width: 18, height: 18 },
  }
})
</script>

<style scoped>
.legenda {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.legenda__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
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

.fluxo-wrapper {
  height: 420px;
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
  width: 190px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 2px solid #4A6CF7;
  text-align: center;
  position: relative;
}

.tarefa-node--inicial {
  border-color: #10B981;
}

.tarefa-node--final {
  border-color: #F59E0B;
}

.tarefa-node strong {
  font-size: 13px;
  line-height: 1.2;
}

.tarefa-node__processo {
  font-size: 10px;
  color: #64748B;
}

.tarefa-node small {
  font-size: 10px;
  color: #64748B;
  text-transform: uppercase;
}

.tarefa-node :deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
