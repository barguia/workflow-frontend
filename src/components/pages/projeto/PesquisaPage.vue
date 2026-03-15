<template>
  <ContainerComponent fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center mb-4 gap-2">
      <v-icon color="primary" size="22">mdi-magnify</v-icon>
      <span class="text-h6 font-weight-bold">Pesquisa de Registros</span>
    </div>

    <CardComponent rounded="xl" variant="elevated">
      <CardTextComponent class="pa-5">

        <!-- Toggle Finalizados / Pendentes -->
        <div class="mb-5">
          <div class="text-caption font-weight-bold text-uppercase mb-2" style="opacity:.65; letter-spacing:.06em">
            Tipo de Registro
          </div>
          <v-btn-toggle
            v-model="modo"
            mandatory
            rounded="pill"
            color="primary"
            density="comfortable"
            @update:model-value="onModoChange"
          >
            <v-btn value="pendentes" prepend-icon="mdi-clock-outline">
              Pendentes
            </v-btn>
            <v-btn value="finalizados" prepend-icon="mdi-check-circle-outline">
              Finalizados
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-divider class="mb-5" />

        <!-- Filtros -->
        <div class="text-caption font-weight-bold text-uppercase mb-3" style="opacity:.65; letter-spacing:.06em">
          Filtros
        </div>

        <v-row dense>
          <!-- Projetos -->
          <v-col cols="12" md="6">
            <SelectComponent
              v-model="filtros.projetos"
              label="Projetos"
              :items="opcoes.projetos"
              :loading="carregando.projetos"
              multiple
              clearable
              chips
              closable-chips
            />
          </v-col>

          <!-- Macro Processo -->
          <v-col cols="12" md="6">
            <SelectComponent
              v-model="filtros.macroProcessos"
              label="Macro Processo"
              :items="opcoes.macroProcessos"
              :loading="carregando.macroProcessos"
              multiple
              clearable
              chips
              closable-chips
            />
          </v-col>

          <!-- Processo -->
          <v-col cols="12" md="6">
            <SelectComponent
                v-model="filtros.processos"
              label="Processo"
              :items="opcoes.processos"
              :loading="carregando.processos"
              multiple
              clearable
              chips
              closable-chips
            />
          </v-col>

          <!-- Status — apenas Pendentes -->
          <v-col v-if="modo === 'pendentes'" cols="12" md="6">
            <SelectComponent
              v-model="filtros.status"
              label="Status"
              :items="opcoes.status"
              :loading="carregando.status"
              multiple
              clearable
              chips
              closable-chips
            />
          </v-col>

          <!-- Tarefas -->
          <v-col cols="12" md="6">
            <SelectComponent
              v-model="filtros.tarefas"
              label="Tarefas"
              :items="opcoes.tarefas"
              :loading="carregando.tarefas"
              multiple
              clearable
              chips
              closable-chips
            />
          </v-col>
        </v-row>

        <!-- Ações -->
        <div class="d-flex justify-end gap-3 mt-5">
          <ButtonComponent variant="text" color="default" @click="limparFiltros">
            <v-icon start>mdi-filter-off-outline</v-icon>
            Limpar
          </ButtonComponent>
          <ButtonComponent color="primary" :loading="pesquisando" @click="pesquisar">
            <v-icon start>mdi-magnify</v-icon>
            Pesquisar
          </ButtonComponent>
        </div>

      </CardTextComponent>
    </CardComponent>

    <!-- Resultados -->
    <div v-if="resultados !== null" class="mt-6">
      <CardComponent rounded="xl" variant="elevated">
        <v-data-table
          :headers="headersResultado"
          :items="resultados"
          :items-per-page="15"
          class="elevation-0"
          hover
        >
          <template #top>
            <div class="table-toolbar pa-4 d-flex align-center ga-3">
              <span class="text-subtitle-1 font-weight-semibold">
                Resultados
                <v-chip size="small" color="primary" class="ml-2">{{ resultados.length }}</v-chip>
              </span>
              <v-spacer />
              <TextFieldComponent
                v-model="buscaLocal"
                prepend-inner-icon="mdi-magnify"
                label="Buscar nos resultados"
                single-line
                hide-details
                density="compact"
                style="max-width: 280px"
                clearable
              />
            </div>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-eye-outline"
              variant="text"
              size="small"
              color="secondary"
              :href="`/ficha-tecnica/${item.id}`"
              target="_blank"
            />
          </template>

          <template #no-data>
            <div class="py-8 text-center text-medium-emphasis">
              <v-icon size="40" class="mb-2">mdi-inbox-outline</v-icon>
              <div>Nenhum registro encontrado.</div>
            </div>
          </template>
        </v-data-table>
      </CardComponent>
    </div>

  </ContainerComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrud } from '@/services/useCrud.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'

const { index: fetchProjetos }     = useCrud('wf/projetos')
const { index: fetchProcessos }    = useCrud('wf/processos')
const { index: fetchStatus }       = useCrud('wf/status')
const { index: fetchTarefas }      = useCrud('wf/tarefas')

const modo = ref('pendentes')

const filtros = ref({
  projetos:      [],
  macroProcessos: [],
  ctrl_processo_id:     [],
  status:        [],
  tarefas:       [],
})

const opcoes = ref({
  projetos:      [],
  macroProcessos: [],
  ctrl_processo_id:     [],
  status:        [],
  tarefas:       [],
})

const carregando = ref({
  projetos:      false,
  macroProcessos: false,
  processos:     false,
  status:        false,
  tarefas:       false,
})

const pesquisando = ref(false)
const resultados  = ref(null)
const buscaLocal  = ref('')

const headersResultado = [
  { title: '',               value: 'actions',        sortable: false },
  { title: 'Projeto',        value: 'projeto',        sortable: true },
  { title: 'Macro Processo', value: 'macro_processo', sortable: true },
  { title: 'Processo',       value: 'processo',       sortable: true },
  { title: 'Tarefa',         value: 'tarefa',         sortable: true },
  { title: 'Status',         value: 'status',         sortable: true },
]

async function carregarOpcoes() {
  await Promise.all([
    carregarProjetos(),
    carregarProcessos(),
    carregarTarefas(),
    modo.value === 'pendentes' ? carregarStatus() : Promise.resolve(),
  ])
}

async function carregarProjetos() {
  carregando.value.projetos = true
  try {
    const data = await fetchProjetos()
    opcoes.value.projetos = (data ?? []).map(p => ({ value: p.id, text: p.nome ?? p.projeto ?? String(p.id) }))
  } finally {
    carregando.value.projetos = false
  }
}

async function carregarProcessos() {
  carregando.value.macroProcessos = true
  carregando.value.processos = true
  try {
    const data = await fetchProcessos()
    const mapeado = (data ?? []).map(p => ({ value: p.id, text: p.processo ?? String(p.id) }))
    opcoes.value.macroProcessos = mapeado
    opcoes.value.processos = mapeado
  } finally {
    carregando.value.macroProcessos = false
    carregando.value.processos = false
  }
}

async function carregarStatus() {
  carregando.value.status = true
  try {
    const data = await fetchStatus()
    opcoes.value.status = (data ?? []).map(s => ({ value: s.id, text: s.status ?? s.nome ?? String(s.id) }))
  } finally {
    carregando.value.status = false
  }
}

async function carregarTarefas() {
  carregando.value.tarefas = true
  try {
    const data = await fetchTarefas()
    opcoes.value.tarefas = (data ?? []).map(t => ({ value: t.id, text: t.tarefa ?? String(t.id) }))
  } finally {
    carregando.value.tarefas = false
  }
}

async function onModoChange() {
  filtros.value.status = []
  if (modo.value === 'pendentes' && opcoes.value.status.length === 0) {
    await carregarStatus()
  }
}

function limparFiltros() {
  filtros.value = {
    projetos:      [],
    macroProcessos: [],
    processos:     [],
    status:        [],
    tarefas:       [],
  }
  resultados.value = null
  buscaLocal.value = ''
}

async function pesquisar() {
  pesquisando.value = true
  try {
    const payload = {
      modo:                   modo.value,
      pco_projeto_id:         filtros.value.projetos,
      ctrl_macro_processo_id: filtros.value.macroProcessos,
      ctrl_processo_id:       filtros.value.processos,
      ctrl_tarefa_id:         filtros.value.tarefas,
    }
    if (modo.value === 'pendentes') {
      payload.ctrl_status_id = filtros.value.status
    }

    const { default: api } = await import('@/services/api.js')
    const res = await api.post('wf/projetos/pesquisa', payload)
    resultados.value = res.data?.data ?? []
  } catch {
    resultados.value = []
  } finally {
    pesquisando.value = false
  }
}

onMounted(carregarOpcoes)
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
