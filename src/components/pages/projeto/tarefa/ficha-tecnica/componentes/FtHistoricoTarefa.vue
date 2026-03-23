<template>
  <div>
    <div class="d-flex align-center gap-3 mb-3">
      <div class="text-subtitle-1 font-weight-bold">Histórico de Tratamentos</div>
      <SpacerComponent />
      <ButtonComponent size="small" variant="text" color="primary" :loading="carregando" @click="$emit('atualizar')">
        <IconComponent start>mdi-refresh</IconComponent>
        Atualizar
      </ButtonComponent>
    </div>

    <CardComponent rounded="xl" variant="elevated">
      <v-data-table
        :headers="headers"
        :items="tratamentos"
        :items-per-page="10"
        :loading="carregando"
        class="elevation-0"
        hover
      >
        <template #top>
          <div class="table-toolbar pa-4 d-flex align-center ga-3">
            <span class="text-subtitle-2 font-weight-semibold">
              Tratamentos
              <ChipComponent size="x-small" color="primary" class="ml-2">{{ tratamentos.length }}</ChipComponent>
            </span>
          </div>
        </template>

        <template #item.status="{ item }">
          <ChipComponent size="small" variant="tonal" color="primary">
            {{ item.status ?? '—' }}
          </ChipComponent>
        </template>

        <template #item.created_at="{ item }">
          {{ formatarDataHora(item.created_at) }}
        </template>

        <template #no-data>
          <div class="py-8 text-center text-medium-emphasis">
            <IconComponent size="40" class="mb-2">mdi-clipboard-text-outline</IconComponent>
            <div>Nenhum tratamento registrado.</div>
          </div>
        </template>
      </v-data-table>
    </CardComponent>
  </div>
</template>

<script setup>
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'

defineProps({
  tratamentos: { type: Array, default: () => [] },
  carregando:  { type: Boolean, default: false },
})

defineEmits(['atualizar'])

const headers = [
  { title: 'Data',        value: 'created_at', sortable: true },
  { title: 'Status',      value: 'status',     sortable: true },
  { title: 'Responsável', value: 'usuario',    sortable: true },
  { title: 'Comentário',  value: 'comentario', sortable: false },
]

function formatarDataHora(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.table-toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

:deep(.v-data-table-header__content) {
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
}
</style>
