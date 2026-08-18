<template>
  <div class="layout-flow">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @nodes-initialized="layoutGraph('LR')"
    >
      <Background />

      <Panel
        class="process-panel"
        position="top-right"
      >
        <div class="layout-panel">
          <button
            title="set horizontal layout"
            @click="layoutGraph('LR')"
          >
            <v-icon>mdi-arrow-right-bold</v-icon>
          </button>

          <button
            title="set vertical layout"
            @click="layoutGraph('TB')"
          >
            <v-icon>mdi-arrow-down-bold</v-icon>
          </button>
        </div>
      </Panel>
    </VueFlow>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'

import { initialEdges, initialNodes } from './data/dagreLayoutExemplo.js'
import { useDagreLayout } from './data/useDagreLayout.js'

const nodes = ref(initialNodes)

const edges = ref(initialEdges)

const { layout } = useDagreLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)

  nextTick(() => {
    fitView()
  })
}
</script>

<style scoped>
.layout-flow {
  background-color: #1a192b;
  height: 100vh;
  width: 100%;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  background-color: #2d3748;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.process-panel button {
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.layout-flow :deep(.vue-flow__node-default) {
  background-color: #ffffff;
  color: #1a192b;
  border: 1px solid #d1d5db;
}
</style>
