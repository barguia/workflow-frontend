<!-- src/components/form-dinamico/FormularioDinamicoSnapshot.vue -->
<!-- Dispatcher: escolhe o renderer certo em snapshot-versoes/ de acordo com a versão em que o -->
<!-- snapshot foi salvo. Componentes que consomem isso não precisam saber que versões existem. -->
<template>
  <component
    :is="componenteVersao"
    :snapshot="snapshot"
  />
</template>

<script setup>
import { computed } from 'vue'
import { SNAPSHOT_VERSION_ATUAL, versoes } from '@/components/form-dinamico/snapshot-versoes/index.js'

const props = defineProps({
  snapshot: { type: Object, default: () => ({}) },
  snapshotVersion: { type: Number, default: SNAPSHOT_VERSION_ATUAL },
})

const componenteVersao = computed(() => versoes[props.snapshotVersion] ?? versoes[SNAPSHOT_VERSION_ATUAL])
</script>
