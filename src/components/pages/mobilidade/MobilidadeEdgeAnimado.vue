<template>
  <BaseEdge
    :id="id"
    :path="path"
    :marker-end="markerEnd"
    :style="estiloAnimado"
  />
</template>

<script setup>
import { computed } from 'vue'
import { BaseEdge } from '@vue-flow/core'

// Mesmo deslocamento perpendicular do MobilidadeEdgeCurva (data.offset),
// mas com stroke-dasharray + animation para o efeito "ANIMATED STYLED EDGE"
// do exemplo do Vue Flow — usado aqui para destacar uma devolução específica
// entre as demais edges "estáticas" da vitrine de tipos.
const props = defineProps({
  id: { type: String, required: true },
  sourceX: { type: Number, required: true },
  sourceY: { type: Number, required: true },
  targetX: { type: Number, required: true },
  targetY: { type: Number, required: true },
  markerEnd: { type: String, default: undefined },
  style: { type: Object, default: undefined },
  data: { type: Object, default: () => ({}) },
})

const path = computed(() => {
  const offset = props.data?.offset ?? 0
  const dx = props.targetX - props.sourceX
  const dy = props.targetY - props.sourceY
  const distancia = Math.hypot(dx, dy) || 1
  const normalX = -dy / distancia
  const normalY = dx / distancia
  const meioX = (props.sourceX + props.targetX) / 2 + normalX * offset
  const meioY = (props.sourceY + props.targetY) / 2 + normalY * offset

  return `M${props.sourceX},${props.sourceY} Q${meioX},${meioY} ${props.targetX},${props.targetY}`
})

const estiloAnimado = computed(() => ({
  ...(props.style ?? {}),
  strokeDasharray: '8 6',
  animation: 'mobilidade-edge-tracejado 0.8s linear infinite',
}))
</script>

<style scoped>
@keyframes mobilidade-edge-tracejado {
  to {
    stroke-dashoffset: -14;
  }
}
</style>
