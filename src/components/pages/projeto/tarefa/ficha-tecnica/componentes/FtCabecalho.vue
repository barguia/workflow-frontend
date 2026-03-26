<template>
  <div class="d-flex align-center gap-3 mb-4 flex-wrap">
    <ButtonComponent icon="mdi-arrow-left" variant="text" size="small" @click="$emit('voltar')" />

    <div class="flex-1-1">
      <div class="d-flex align-center gap-2 flex-wrap">
        <span class="text-h6 font-weight-bold">{{ tarefa.nome }}</span>
        <ChipComponent
          :color="tarefa.finalized_at ? 'success' : 'primary'"
          size="small"
          variant="tonal"
          label
        >
          {{ tarefa.status_tarefa ?? (tarefa.finalized_at ? 'Finalizado' : 'Em andamento') }}
        </ChipComponent>
        <ChipComponent
          v-if="tarefa.prioridade"
          :color="corPrioridade(tarefa.prioridade)"
          size="small"
          variant="tonal"
          label
        >
          {{ tarefa.prioridade }}
        </ChipComponent>
      </div>
      <div class="text-caption text-medium-emphasis mt-1 d-flex align-center gap-3 flex-wrap">
        <span>Projeto #{{ tarefa.pco_projeto_id }}</span>
        <span class="text-medium-emphasis">·</span>
        <span>
          <IconComponent size="13" class="mr-1">mdi-calendar-plus-outline</IconComponent>
          {{ formatarDataHora(tarefa.created_at) }}
        </span>
        <template v-if="tarefa.finalized_at">
          <span class="text-medium-emphasis">·</span>
          <span class="text-success">
            <IconComponent size="13" class="mr-1">mdi-calendar-check-outline</IconComponent>
            Fechado em {{ formatarDataHora(tarefa.finalized_at) }}
          </span>
        </template>
        <span class="text-medium-emphasis">·</span>
        <ChipComponent
          :color="agingColor(tarefa.aging_workflow)"
          size="x-small"
          variant="tonal"
        >
          <IconComponent start size="12">mdi-clock-outline</IconComponent>
          Aging: {{ tarefa.aging_workflow ?? 0 }}d
        </ChipComponent>
      </div>
    </div>

    <SpacerComponent />

    <slot name="acoes" />
  </div>
</template>

<script setup>
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'

defineProps({
  tarefa: { type: Object, required: true },
})

defineEmits(['voltar'])

function corPrioridade(prioridade) {
  const map = { alta: 'error', media: 'warning', média: 'warning', baixa: 'success' }
  return map[(prioridade ?? '').toLowerCase()] ?? 'default'
}

function agingColor(aging) {
  const v = aging ?? 0
  return v > 30 ? 'error' : v > 15 ? 'warning' : 'success'
}

function formatarDataHora(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>
