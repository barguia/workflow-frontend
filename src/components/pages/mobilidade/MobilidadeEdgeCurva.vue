<template>
  <BaseEdge
    :id="id"
    :path="path"
    :marker-end="markerEnd"
    :style="style"
  />
</template>

<script setup>
import { computed } from 'vue'
import { BaseEdge } from '@vue-flow/core'

// O edge bezier padrão do Vue Flow calcula a curva a partir da posição dos
// handles (top/bottom) — funciona bem quando os nós estão alinhados na
// horizontal, mas com o layout em grade serpenteada os nós de um mesmo par
// costumam ficar na diagonal, e aí avanço e devolução acabam desenhando
// quase a mesma linha (handles top/bottom viram um deslocamento insignificante
// perto da distância entre os nós). Este edge desloca o ponto de controle da
// curva PERPENDICULARMENTE à reta origem→destino por um valor fixo em
// pixels (data.offset, positivo pra avanço e negativo pra devolução) —
// funciona não importa o ângulo entre os nós, igual ao curvedCW/CCW do
// vis-network.
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
</script>
