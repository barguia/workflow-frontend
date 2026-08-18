<template>
  <ContainerComponent>
    <CardComponent
      max-width="1100"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — Exemplo (A → B → C → D)
      </CardTitleComponent>
      <CardTextComponent>
        <div class="legenda">
          <span class="legenda__item">
            <span class="legenda__linha legenda__linha--avanco" />
            Avanço
          </span>
          <span class="legenda__item">
            <span class="legenda__linha legenda__linha--retorno" />
            Retorno
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
                <strong>{{ data.label }}</strong>
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

const COR_AVANCO = '#3B82F6'
const COR_RETORNO = '#EF4444'

const nodes = [
  { id: 'A', type: 'tarefa', position: { x: 0, y: 160 }, data: { label: 'A', inicial: true } },
  { id: 'B', type: 'tarefa', position: { x: 280, y: 160 }, data: { label: 'B' } },
  { id: 'C', type: 'tarefa', position: { x: 560, y: 360 }, data: { label: 'C' } },
  { id: 'D', type: 'tarefa', position: { x: 840, y: 160 }, data: { label: 'D', final: true } },
]

// Cada mobilidade usa os handles "top" para avanço (arco por cima) e
// "bottom" para retorno (arco por baixo), evitando que as duas arestas
// entre o mesmo par de tarefas se sobreponham visualmente.
const mobilidade = (source, target, direcao) => {
  const avanco = direcao === 'avanco'
  const cor = avanco ? COR_AVANCO : COR_RETORNO

  return {
    id: `${source}-${target}-${direcao}`,
    source,
    target,
    sourceHandle: avanco ? 'top-source' : 'bottom-source',
    targetHandle: avanco ? 'top-target' : 'bottom-target',
    style: { stroke: cor, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: cor, width: 18, height: 18 },
  }
}

const edges = [
  mobilidade('A', 'B', 'avanco'),
  mobilidade('B', 'A', 'retorno'),
  mobilidade('B', 'C', 'avanco'),
  mobilidade('C', 'B', 'retorno'),
  mobilidade('C', 'A', 'retorno'),
  mobilidade('C', 'D', 'avanco'),
  mobilidade('D', 'C', 'retorno'),
]
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

.legenda__linha--retorno {
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #4A6CF7;
  font-size: 20px;
  position: relative;
}

.tarefa-node--inicial {
  border-color: #10B981;
}

.tarefa-node--final {
  border-color: #F59E0B;
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
