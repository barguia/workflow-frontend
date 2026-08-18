<template>
  <BaseEdge
    :id="id"
    :path="path"
    :marker-end="markerEnd"
    :style="style"
  />
  <EdgeLabelRenderer>
    <div
      class="mobilidade-edge-rotulo"
      :style="{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }"
    >
      {{ data.rotulo }}
    </div>
  </EdgeLabelRenderer>
</template>

<script setup>
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from '@vue-flow/core'

// Equivalente ao "STYLED CUSTOM EDGE LABEL" do exemplo do Vue Flow: em vez
// do texto embutido no BaseEdge (label/labelStyle), renderiza um badge HTML
// via EdgeLabelRenderer, posicionado no centro da curva bezier.
// Com dois nós-raiz (BaseEdge + EdgeLabelRenderer) o Vue não consegue
// repassar os atributos extras do Vue Flow (sourceNode, targetNode etc.)
// automaticamente — mesmo tratamento que o próprio BaseEdge já faz.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  sourceX: { type: Number, required: true },
  sourceY: { type: Number, required: true },
  targetX: { type: Number, required: true },
  targetY: { type: Number, required: true },
  sourcePosition: { type: String, default: Position.Bottom },
  targetPosition: { type: String, default: Position.Top },
  markerEnd: { type: String, default: undefined },
  style: { type: Object, default: undefined },
  data: { type: Object, default: () => ({}) },
})

const caminho = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
)

const path = computed(() => caminho.value[0])
const labelX = computed(() => caminho.value[1])
const labelY = computed(() => caminho.value[2])
</script>

<style scoped>
.mobilidade-edge-rotulo {
  position: absolute;
  pointer-events: none;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #fff;
  background: #7C3AED;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
</style>
