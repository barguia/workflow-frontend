<template>
  <ContainerComponent fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center gap-3 mb-4">
      <ButtonComponent icon="mdi-arrow-left" variant="text" size="small" @click="router.back()" />
      <div>
        <div class="d-flex align-center gap-2">
          <IconComponent color="primary" size="20">mdi-format-list-checks</IconComponent>
          <span class="text-h6 font-weight-bold">Fila de Tarefas</span>
        </div>
        <div v-if="tarefas.length" class="text-caption text-medium-emphasis mt-1">
          {{ tarefas[0]?.nome }} · {{ tarefas[0]?.workflow }}
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <CardComponent rounded="xl" variant="elevated">
      <v-data-table
        :headers="headers"
        :items="tarefas"
        :items-per-page="15"
        :loading="carregando"
        :search="busca"
        class="elevation-0"
        hover
      >
        <template #top>
          <div class="table-toolbar pa-4 d-flex align-center ga-3">
            <span class="text-subtitle-1 font-weight-semibold">
              Tarefas
              <ChipComponent size="small" color="primary" class="ml-2">{{ tarefas.length }}</ChipComponent>
            </span>
            <SpacerComponent />
            <TextFieldComponent
              v-model="busca"
              prepend-inner-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
              density="compact"
              style="max-width: 280px"
              clearable
            />
          </div>
        </template>

        <!-- Ações -->
        <template #item.actions="{ item }">
          <ButtonComponent
            icon="mdi-clipboard-text-outline"
            variant="text"
            size="small"
            color="primary"
            :href="`/ficha-tecnica-tarefa/${item.pco_tarefa_id}`"
            target="_blank"
            title="Ficha técnica da tarefa"
          />
          <ButtonComponent
            icon="mdi-eye-outline"
            variant="text"
            size="small"
            color="secondary"
            :href="`/ficha-tecnica/${item.pco_projeto_id}`"
            target="_blank"
            title="Ficha técnica do projeto"
          />
        </template>

        <!-- Status com chip -->
        <template #item.status_tarefa="{ item }">
          <ChipComponent
            :color="item.finalized_at ? 'success' : 'warning'"
            size="small"
            variant="tonal"
            label
          >
            {{ item.status_tarefa }}
          </ChipComponent>
        </template>

        <!-- Prioridade com chip -->
        <template #item.prioridade="{ item }">
          <ChipComponent
            :color="corPrioridade(item.prioridade)"
            size="small"
            variant="tonal"
            label
          >
            {{ item.prioridade }}
          </ChipComponent>
        </template>

        <!-- Aging com destaque -->
        <template #item.aging_tarefa="{ item }">
          <ChipComponent
            :color="item.aging_tarefa > 30 ? 'error' : item.aging_tarefa > 15 ? 'warning' : 'default'"
            size="small"
            variant="tonal"
          >
            {{ item.aging_tarefa }}d
          </ChipComponent>
        </template>

        <!-- Sem dados -->
        <template #no-data>
          <div class="py-8 text-center text-medium-emphasis">
            <IconComponent size="40" class="mb-2">mdi-inbox-outline</IconComponent>
            <div>Nenhuma tarefa encontrada.</div>
          </div>
        </template>

      </v-data-table>
    </CardComponent>

  </ContainerComponent>

  <SnackbarComponent v-model="showErros" color="error" timeout="6000" location="top">
    <div class="text-body-2 font-weight-medium mb-1">Erro de validação</div>
    <div v-for="(msgs, campo) in validationErrors" :key="campo">
      <span v-for="msg in msgs" :key="msg">· {{ msg }}</span>
    </div>
    <template #actions>
      <ButtonComponent variant="text" color="white" size="small" @click="showErros = false">Fechar</ButtonComponent>
    </template>
  </SnackbarComponent>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useValidationErrors } from '@/composables/useValidationErrors.js'

import api from '@/services/api.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'

const { validationErrors } = useValidationErrors()
const showErros = ref(false)

watch(validationErrors, (val) => {
  if (val && Object.keys(val).length > 0) showErros.value = true
})

const route  = useRoute()
const router = useRouter()

const tarefas   = ref([])
const carregando = ref(false)
const busca     = ref('')

const headers = [
  { title: '',            value: 'actions',       sortable: false },
  { title: 'tarefa',      value: 'tarefa',        sortable: true },
  { title: 'Processo',    value: 'processo',      sortable: true },
  { title: 'Status',      value: 'status_tarefa', sortable: true },
  { title: 'Responsável', value: 'user_tratamento', sortable: true },
  { title: 'Aging',       value: 'aging_tarefa',  sortable: true },
  { title: 'Projeto',     value: 'nome',          sortable: true },
  { title: 'Prioridade',  value: 'prioridade',    sortable: true },
  { title: 'Início',      value: 'data_inicio',   sortable: true },
  { title: 'Término',     value: 'data_fim',      sortable: true },
]

function corPrioridade(prioridade) {
  const map = { alta: 'error', media: 'warning', média: 'warning', baixa: 'success' }
  return map[(prioridade ?? '').toLowerCase()] ?? 'default'
}

async function carregar() {
  carregando.value = true
  try {
    const filtros = {ctrl_workflow_id: 1}
    const res = await api.post(`wf/projetos/dados-fila-tarefa/${route.params.id}`, filtros)
    tarefas.value = res.data?.data ?? []
  } catch {
    tarefas.value = []
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
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
