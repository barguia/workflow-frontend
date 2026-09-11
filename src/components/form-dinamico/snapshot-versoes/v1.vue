<!-- src/components/form-dinamico/snapshot-versoes/v1.vue -->
<!-- Renderer do snapshot na versão 1 (SNAPSHOT_VERSION_ATUAL). Não alterar depois que uma v2 existir — -->
<!-- registros antigos continuam sendo lidos por este arquivo; mudanças de shape viram uma nova versão. -->
<template>
  <RowComponent density="compact">
    <ColComponent
      v-for="(campo, key) in snapshot"
      :key="key"
      :cols="campo.cols ?? 12"
      class="pb-3"
    >
      <div class="text-caption text-medium-emphasis">
        {{ campo.label }}
      </div>

      <div
        v-if="isSelecionavel(campo.type)"
        class="d-flex flex-wrap ga-1 mt-1"
      >
        <ChipComponent
          v-for="opcao in opcoesSelecionadas(campo)"
          :key="opcao.value"
          size="small"
          variant="tonal"
          color="primary"
        >
          {{ opcao.text }}
        </ChipComponent>
        <span
          v-if="opcoesSelecionadas(campo).length === 0"
          class="text-body-2 text-disabled"
        >
          —
        </span>
      </div>

      <div
        v-else-if="campo.type === 'switch'"
        class="text-body-2"
      >
        {{ campo.value === campo.trueValue ? campo.trueLabel : campo.falseLabel }}
      </div>

      <div
        v-else
        class="text-body-2"
      >
        {{ valorExibido(campo.value) }}
      </div>
    </ColComponent>
  </RowComponent>
</template>

<script setup>
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'

defineOptions({ name: 'FormularioDinamicoSnapshotV1' })

defineProps({
  snapshot: { type: Object, default: () => ({}) },
})

const tiposSelecionais = ['select', 'checkbox', 'radio', 'combobox', 'autocomplete']
const isSelecionavel = (type) => tiposSelecionais.includes(type)
const opcoesSelecionadas = (campo) => (campo.campos_opcoes ?? []).filter(o => o.selected)
const valorExibido = (valor) => (valor === null || valor === undefined || valor === '') ? '—' : valor
</script>
