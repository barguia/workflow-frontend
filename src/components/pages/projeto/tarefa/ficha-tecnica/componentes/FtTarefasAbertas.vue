<template>
  <div>
    <div class="d-flex align-center gap-3 mb-3">
      <div class="text-subtitle-1 font-weight-bold">Tarefas Abertas do Workflow</div>
      <SpacerComponent />
      <ButtonComponent
        size="small"
        variant="text"
        color="primary"
        :loading="carregando"
        @click="carregar"
        data-testid="ft-tarefas-abertas-btn-atualizar"
      >
        <IconComponent start>mdi-refresh</IconComponent>
        Atualizar
      </ButtonComponent>
    </div>

    <CardComponent rounded="xl" variant="elevated">

      <!-- Toolbar -->
      <div class="table-toolbar pa-4 d-flex align-center ga-3">
        <span class="text-subtitle-2 font-weight-semibold">
          Tarefas abertas
          <ChipComponent size="x-small" color="primary" class="ml-2" data-testid="ft-tarefas-abertas-contador">
            {{ tarefasFiltradas.length }}
          </ChipComponent>
        </span>
        <SpacerComponent />
        <TextFieldComponent
          v-model="busca"
          prepend-inner-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          density="compact"
          style="max-width: 260px"
          clearable
          data-testid="ft-tarefas-abertas-input-busca"
        />
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="d-flex justify-center py-10" data-testid="ft-tarefas-abertas-loading">
        <ProgressCircularComponent indeterminate color="primary" size="36" />
      </div>

      <!-- Tabela -->
      <v-data-table
        v-else
        :headers="headers"
        :items="tarefasFiltradas"
        :search="busca"
        :items-per-page="10"
        class="elevation-0"
        hover
        data-testid="ft-tarefas-abertas-tabela"
      >
        <template #item.actions="{ item }">
          <ButtonComponent
            icon="mdi-clipboard-text-outline"
            variant="text"
            size="small"
            color="primary"
            :href="`/ficha-tecnica-tarefa/${item.pco_tarefa_id}`"
            target="_self"
            title="Ficha técnica da tarefa"
            :data-testid="`ft-tarefas-abertas-btn-ficha-${item.pco_tarefa_id}`"
          />
        </template>

        <template #item.status_tarefa="{ item }">
          <ChipComponent size="small" variant="tonal" color="primary" :data-testid="`ft-tarefas-abertas-status-${item.pco_tarefa_id}`">
            {{ item.status_tarefa ?? '—' }}
          </ChipComponent>
        </template>

        <template #item.aging_tarefa="{ item }">
          <ChipComponent
            size="small"
            variant="tonal"
            :color="item.aging_tarefa > 30 ? 'error' : item.aging_tarefa > 15 ? 'warning' : 'success'"
            :data-testid="`ft-tarefas-abertas-aging-${item.pco_tarefa_id}`"
          >
            {{ item.aging_tarefa ?? 0 }}d
          </ChipComponent>
        </template>

        <template #no-data>
          <div class="py-10 text-center text-medium-emphasis" data-testid="ft-tarefas-abertas-vazio">
            <IconComponent size="40" class="mb-2">mdi-clipboard-check-outline</IconComponent>
            <div>Nenhuma tarefa aberta neste workflow.</div>
          </div>
        </template>
      </v-data-table>

    </CardComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import api from '@/services/api.js'

import CardComponent       from '@/components/comuns/cards/CardComponent.vue'
import ButtonComponent     from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent       from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent     from '@/components/comuns/layout/SpacerComponent.vue'
import ChipComponent       from '@/components/comuns/chips/ChipComponent.vue'
import TextFieldComponent  from '@/components/comuns/forms/TextFieldComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'

const props = defineProps({
  tarefa: { type: Object, required: true },
})

const tarefas   = ref([])
const carregando = ref(false)
const busca     = ref('')

const headers = [
  { title: '',            value: 'actions',      sortable: false },
  { title: 'Id',          value: 'pco_tarefa_id', sortable: true },
  { title: 'Tarefa',      value: 'tarefa',        sortable: true },
  { title: 'Processo',    value: 'processo',      sortable: true },
  { title: 'Status',      value: 'status_tarefa', sortable: true },
  { title: 'Responsável', value: 'user_tratamento', sortable: true },
  { title: 'Aging (d)',   value: 'aging_tarefa',  sortable: true },
]

const tarefasFiltradas = computed(() =>
  tarefas.value.filter(t => t.pco_tarefa_id !== props.tarefa.pco_tarefa_id)
)

async function carregar() {
  carregando.value = true
  try {
    console.log(props.tarefa)
    const res = await api.post('wf/projetos/pesquisa', {
      finalizados:      false,
      ctrl_workflow_id: props.tarefa.ctrl_workflow_id,
      pco_workflow_id:  [props.tarefa.pco_workflow_id],
    })
    tarefas.value = res.data?.data ?? []
  } catch {
    tarefas.value = []
  } finally {
    carregando.value = false
  }
}

watch(() => props.tarefa?.pco_workflow_id, (val) => {
  if (val) carregar()
})

onMounted(() => {
  if (props.tarefa?.pco_workflow_id) carregar()
})
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
