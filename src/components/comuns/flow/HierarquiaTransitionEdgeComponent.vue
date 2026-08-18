<script setup>
import { ref, watch } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import { getBezierPath } from '@vue-flow/core'

const props = defineProps({
  id: { type: String, required: true },
  sourceX: { type: Number, required: true },
  sourceY: { type: Number, required: true },
  targetX: { type: Number, required: true },
  targetY: { type: Number, required: true },
  sourcePosition: { type: String, required: true },
  targetPosition: { type: String, required: true },
  markerEnd: { type: String, required: false, default: undefined },
  style: { type: Object, required: false, default: undefined },
  tocando: { type: Boolean, default: false },
})

const emit = defineEmits(['concluido'])

const curve = ref()
const posicaoPonto = ref({ x: 0, y: 0 })
const mostrarPonto = ref(false)

const path = () =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })[0]

watch(
  () => props.tocando,
  (tocando) => {
    if (!tocando || !curve.value) return

    mostrarPonto.value = true
    const totalLength = curve.value.getTotalLength()
    const progresso = ref(0)
    let pararObservacaoPosicao

    const saida = useTransition(progresso, {
      duration: Math.max(400, Math.floor(totalLength / 2 / 100) * 1000),
      transition: TransitionPresets.easeOutCubic,
      onFinished: () => {
        pararObservacaoPosicao?.()
        mostrarPonto.value = false
        emit('concluido')
      },
    })

    // Observação criada dentro do callback do watch acima não é presa
    // automaticamente ao escopo do componente — por isso precisa ser parada
    // manualmente ao final (mesmo padrão do exemplo oficial do Vue Flow).
    pararObservacaoPosicao = watch(
      saida,
      (comprimento) => {
        if (curve.value) posicaoPonto.value = curve.value.getPointAtLength(comprimento)
      },
      { immediate: true },
    )

    progresso.value = totalLength
  },
)
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<template>
  <path
    :id="id"
    ref="curve"
    :style="style"
    class="vue-flow__edge-path"
    :d="path()"
    :marker-end="markerEnd"
  />

  <circle
    v-if="mostrarPonto"
    r="5"
    cy="0"
    cx="0"
    :transform="`translate(${posicaoPonto.x}, ${posicaoPonto.y})`"
    style="fill: rgb(var(--v-theme-warning))"
  />
</template>
