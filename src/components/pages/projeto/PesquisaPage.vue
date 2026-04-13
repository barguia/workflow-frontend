<template>
  <ContainerComponent fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center mb-4 gap-2">
      <IconComponent color="primary" size="22">mdi-magnify</IconComponent>
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
            data-testid="pesquisa-toggle-tipo"
          >
            <ButtonComponent value="pendentes" prepend-icon="mdi-clock-outline" data-testid="pesquisa-btn-pendentes">
              Pendentes
            </ButtonComponent>
            <ButtonComponent value="finalizados" prepend-icon="mdi-check-circle-outline" data-testid="pesquisa-btn-finalizados">
              Finalizados
            </ButtonComponent>
          </v-btn-toggle>
        </div>

        <DividerComponent class="mb-5" />

        <!-- Filtros -->
        <div class="text-caption font-weight-bold text-uppercase mb-3" style="opacity:.65; letter-spacing:.06em">
          Filtros
        </div>

        <RowComponent dense>
          <!-- Projetos -->
          <ColComponent cols="12" md="6">
            <SelectComponent
              v-model="filtros.projetos"
              label="Projetos"
              :items="opcoes.projetos"
              :loading="carregando.projetos"
              multiple
              clearable
              chips
              closable-chips
              data-testid="pesquisa-select-projetos"
            />
          </ColComponent>

          <!-- Macro Processo -->
          <ColComponent cols="12" md="6">
            <SelectComponent
              v-model="filtros.macroProcessos"
              label="Macro Processo"
              :items="opcoes.macroProcessos"
              :loading="carregando.macroProcessos"
              multiple
              clearable
              chips
              closable-chips
              data-testid="pesquisa-select-macro-processo"
            />
          </ColComponent>

          <!-- Processo -->
          <ColComponent cols="12" md="6">
            <SelectComponent
                v-model="filtros.processos"
              label="Processo"
              :items="opcoes.processos"
              :loading="carregando.processos"
              multiple
              clearable
              chips
              closable-chips
              data-testid="pesquisa-select-processo"
            />
          </ColComponent>

          <!-- Status — apenas Pendentes -->
          <ColComponent v-if="modo === 'pendentes'" cols="12" md="6">
            <SelectComponent
              v-model="filtros.status"
              label="Status"
              :items="opcoes.status"
              :loading="carregando.status"
              multiple
              clearable
              chips
              closable-chips
              data-testid="pesquisa-select-status"
            />
          </ColComponent>

          <!-- Tarefas -->
          <ColComponent cols="12" md="6">
            <SelectComponent
              v-model="filtros.tarefas"
              label="Tarefas"
              :items="opcoes.tarefas"
              :loading="carregando.tarefas"
              multiple
              clearable
              chips
              closable-chips
              data-testid="pesquisa-select-tarefas"
            />
          </ColComponent>
        </RowComponent>

        <!-- Ações -->
        <div class="d-flex justify-end gap-3 mt-5">
          <ButtonComponent variant="text" color="default" @click="limparFiltros" data-testid="pesquisa-btn-limpar">
            <IconComponent start>mdi-filter-off-outline</IconComponent>
            Limpar
          </ButtonComponent>
          <ButtonComponent color="primary" :loading="pesquisando" @click="pesquisar" data-testid="pesquisa-btn-pesquisar">
            <IconComponent start>mdi-magnify</IconComponent>
            Pesquisar
          </ButtonComponent>
        </div>

      </CardTextComponent>
    </CardComponent>

    <!-- Resultados -->
    <div v-if="rawResultados !== null" class="mt-6" data-testid="pesquisa-tabela-resultados">
      <CardComponent rounded="xl" variant="elevated">
        <CrudDataTableComponent
          :headers="[{ key: 'actions', title: '', sortable: false, align: 'end' }]"
          :items="resultados"
          must-sort
          :items-per-page="perPage"
          :page="currentPage"
          :total-items="totalItems"
          :available-columns="availableColumns"
          :selected-columns="selectedColumns"
          :show-select="false"
          :show-search="false"
          title="Resultados"
          @update:options="handleTableOptions"
          @update:selected-columns="onSelectedColumnsChange"
        >
          <template #actions="{ item }">
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
            />
          </template>
        </CrudDataTableComponent>
      </CardComponent>
    </div>

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
import { ref, computed, watch, onMounted } from 'vue'
import { useCrud } from '@/services/useCrud.js'
import { useValidationErrors } from '@/composables/useValidationErrors.js'
import { useColumnSelection } from '@/composables/useColumnSelection.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import CrudDataTableComponent from '@/components/crud/CrudDataTableComponent.vue'

const { validationErrors, clearErrors } = useValidationErrors()
const showErros = ref(false)

watch(validationErrors, (val) => {
  if (val && Object.keys(val).length > 0) showErros.value = true
})

const { index: fetchProjetos }  = useCrud('wf/projetos')
const { index: fetchProcessos } = useCrud('wf/processos')
const { index: fetchStatus }    = useCrud('wf/status')
const { index: fetchTarefas }   = useCrud('wf/tarefas')
const { search: executarPesquisa, fetchColumns } = useCrud('wf/projetos')
const { initColumns, saveColumns } = useColumnSelection('pesquisa:wf/projetos')

const modo = ref('pendentes')

const filtros = ref({
  projetos:      [],
  macroProcessos: [],
  processos:     [],
  status:        [],
  tarefas:       [],
})

const opcoes = ref({
  projetos:      [],
  macroProcessos: [],
  processos:     [],
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

const pesquisando     = ref(false)
const rawResultados   = ref(null)

// Paginação server-side
const currentPage    = ref(1)
const perPage        = ref(50)
const totalItems     = ref(0)
const currentSortBy  = ref([])
let skipNextOptionsEvent = true

const resultados = computed(() => {
  if (!rawResultados.value) return null
  if (!currentSortBy.value.length) return rawResultados.value
  const { key, order } = currentSortBy.value[0]
  return [...rawResultados.value].sort((a, b) => {
    const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true, sensitivity: 'base' })
    return order === 'desc' ? -cmp : cmp
  })
})

// Colunas
const availableColumns = ref([])
const selectedColumns  = ref([])

// Guarda os filtros da última pesquisa para reuso na paginação
const ultimaQuery = ref(null)

async function loadResultados() {
  if (!ultimaQuery.value) return
  pesquisando.value = true
  try {
    const response = await executarPesquisa(
      ultimaQuery.value,
      {
        page: currentPage.value,
        per_page: perPage.value === -1 ? 99999 : perPage.value,
      }
    )
    if (response && !Array.isArray(response) && 'data' in response && 'total' in response) {
      rawResultados.value = response.data
      totalItems.value    = response.total
      currentPage.value   = response.current_page
      perPage.value       = response.per_page
    } else {
      rawResultados.value = Array.isArray(response) ? response : []
      totalItems.value    = rawResultados.value.length
    }
  } catch {
    rawResultados.value = []
    totalItems.value    = 0
  } finally {
    pesquisando.value = false
  }
}

async function pesquisar() {
  clearErrors()
  ultimaQuery.value = {
    ctrl_workflow_id:       1,
    finalizados:            modo.value === 'finalizados',
    pco_projeto_id:         filtros.value.projetos,
    ctrl_macro_processo_id: filtros.value.macroProcessos,
    ctrl_processo_id:       filtros.value.processos,
    ctrl_tarefa_id:         filtros.value.tarefas,
    ...(modo.value === 'pendentes' ? { ctrl_status_id: filtros.value.status } : {}),
  }
  currentPage.value   = 1
  currentSortBy.value = []
  skipNextOptionsEvent = true
  await loadResultados()
}

const handleTableOptions = ({ page, itemsPerPage, sortBy }) => {
  if (skipNextOptionsEvent) { skipNextOptionsEvent = false; return }
  currentSortBy.value = sortBy ?? []
  if (page !== currentPage.value || itemsPerPage !== perPage.value) {
    currentPage.value = page
    perPage.value = itemsPerPage
    loadResultados()
  }
}

const onSelectedColumnsChange = (cols) => {
  selectedColumns.value = cols
  saveColumns(cols)
  if (ultimaQuery.value) loadResultados()
}

function limparFiltros() {
  filtros.value = { projetos: [], macroProcessos: [], processos: [], status: [], tarefas: [] }
  rawResultados.value = null
  ultimaQuery.value   = null
  totalItems.value  = 0
  currentPage.value = 1
}

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
  } finally { carregando.value.projetos = false }
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
  } finally { carregando.value.status = false }
}

async function carregarTarefas() {
  carregando.value.tarefas = true
  try {
    const data = await fetchTarefas()
    opcoes.value.tarefas = (data ?? []).map(t => ({ value: t.id, text: t.tarefa ?? String(t.id) }))
  } finally { carregando.value.tarefas = false }
}

async function onModoChange() {
  filtros.value.status = []
  if (modo.value === 'pendentes' && opcoes.value.status.length === 0) {
    await carregarStatus()
  }
}

onMounted(async () => {
  carregarOpcoes()
  const cols = await fetchColumns()
  availableColumns.value = [...cols, 'actions']
  selectedColumns.value  = initColumns(availableColumns.value)
})
</script>
