<template>
  <ContainerComponent>
    <CardComponent
      max-width="1100"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — vis-network (A → B → C → D)
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

        <div
          ref="containerRef"
          class="fluxo-wrapper"
        />
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'

const COR_AVANCO = '#3B82F6'
const COR_RETORNO = '#EF4444'

const containerRef = ref(null)
let network = null

const nodes = new DataSet([
  { id: 'A', label: 'A', x: 0, y: 160, fixed: true },
  { id: 'B', label: 'B', x: 280, y: 160, fixed: true },
  { id: 'C', label: 'C', x: 560, y: 360, fixed: true },
  { id: 'D', label: 'D', x: 840, y: 160, fixed: true },
])

// vis-network curva arestas paralelas em sentidos opostos (curvedCW/curvedCCW)
// para separar visualmente avanço e retorno entre o mesmo par de tarefas —
// dispensa o truque de handles top/bottom usado na versão Vue Flow.
const mobilidade = (source, target, direcao) => {
  const avanco = direcao === 'avanco'
  return {
    from: source,
    to: target,
    color: { color: avanco ? COR_AVANCO : COR_RETORNO },
    smooth: { type: avanco ? 'curvedCW' : 'curvedCCW', roundness: 0.2 },
  }
}

const edges = new DataSet([
  mobilidade('A', 'B', 'avanco'),
  mobilidade('B', 'A', 'retorno'),
  mobilidade('B', 'C', 'avanco'),
  mobilidade('C', 'B', 'retorno'),
  mobilidade('C', 'A', 'retorno'),
  mobilidade('C', 'D', 'avanco'),
  mobilidade('D', 'C', 'retorno'),
])

const options = {
  physics: false,
  interaction: { dragNodes: false, zoomView: false, dragView: false },
  nodes: {
    shape: 'circle',
    font: { size: 20 },
    color: { background: '#fff', border: '#4A6CF7' },
    borderWidth: 2,
    size: 40,
  },
  edges: {
    arrows: { to: { enabled: true, scaleFactor: 0.7 } },
    width: 2,
  },
}

onMounted(() => {
  network = new Network(containerRef.value, { nodes, edges }, options)
})

onBeforeUnmount(() => {
  network?.destroy()
  network = null
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

.legenda__linha--retorno {
  background: #EF4444;
}

.fluxo-wrapper {
  height: 420px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
</style>
