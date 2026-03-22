<template>
  <!-- 404 -->
  <ContainerComponent v-if="naoEncontrado" class="fill-height d-flex align-center justify-center text-center" fluid>
    <div>
      <IconComponent size="72" color="error">mdi-file-alert-outline</IconComponent>
      <div class="text-h5 font-weight-bold mt-4">Registro não encontrado</div>
      <p class="text-body-1 mt-2 text-medium-emphasis">
        A tarefa com ID <strong>#{{ route.params.id }}</strong> não existe ou foi removida.
      </p>
      <ButtonComponent class="mt-6" color="primary" @click="router.back()">
        <IconComponent start>mdi-arrow-left</IconComponent>
        Voltar
      </ButtonComponent>
    </div>
  </ContainerComponent>

  <!-- Carregando -->
  <ContainerComponent v-else-if="carregando" class="fill-height d-flex align-center justify-center" fluid>
    <ProgressCircularComponent indeterminate color="primary" size="48" />
  </ContainerComponent>

  <!-- Conteúdo -->
  <ContainerComponent v-else-if="tarefa" fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center gap-3 mb-4">
      <ButtonComponent icon="mdi-arrow-left" variant="text" size="small" @click="router.back()" />
      <div class="flex-1-1">
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="text-h6 font-weight-bold">{{ tarefa.tarefa }}</span>
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
        <div class="text-caption text-medium-emphasis mt-1">
          {{ tarefa.processo }} · {{ tarefa.workflow }} · Tarefa #{{ tarefa.pco_tarefa_id }}
        </div>
      </div>
      <SpacerComponent />
      <ButtonComponent
        color="primary"
        variant="tonal"
        size="small"
        :disabled="!!tarefa.finalized_at"
        @click="abrirDialogTratamento"
      >
        <IconComponent start>mdi-clipboard-edit-outline</IconComponent>
        Registrar Tratamento
      </ButtonComponent>
    </div>

    <RowComponent dense>

      <!-- Identificação da Tarefa -->
      <ColComponent cols="12" md="8">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-5">
            <div class="section-label mb-3">Identificação da Tarefa</div>
            <RowComponent dense>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Tarefa</div>
                <div class="field-value">{{ tarefa.tarefa ?? '—' }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Processo</div>
                <div class="field-value">{{ tarefa.processo ?? '—' }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Workflow</div>
                <div class="field-value">{{ tarefa.workflow ?? '—' }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Projeto</div>
                <div class="field-value d-flex align-center gap-1">
                  {{ tarefa.nome ?? '—' }}
                  <ButtonComponent
                    v-if="tarefa.pco_projeto_id"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="x-small"
                    color="primary"
                    :href="`/ficha-tecnica/${tarefa.pco_projeto_id}`"
                    target="_blank"
                  />
                </div>
              </ColComponent>
            </RowComponent>

            <DividerComponent class="my-4" />

            <div class="section-label mb-3">Prazos</div>
            <RowComponent dense>
              <ColComponent cols="12" sm="4">
                <div class="field-label">Data de Início</div>
                <div class="field-value">{{ formatarData(tarefa.data_inicio) }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="4">
                <div class="field-label">Data de Término</div>
                <div class="field-value">{{ formatarData(tarefa.data_fim) }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="4">
                <div class="field-label">Finalizado em</div>
                <div class="field-value">{{ tarefa.finalized_at ? formatarDataHora(tarefa.finalized_at) : '—' }}</div>
              </ColComponent>
            </RowComponent>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

      <!-- Estado atual / Métricas -->
      <ColComponent cols="12" md="4">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-5">
            <div class="section-label mb-3">Estado Atual</div>

            <div class="metric-row">
              <div class="metric-label">Status</div>
              <ChipComponent
                :color="tarefa.finalized_at ? 'success' : 'primary'"
                size="small"
                variant="tonal"
              >
                {{ tarefa.status_tarefa ?? (tarefa.finalized_at ? 'Finalizado' : 'Em andamento') }}
              </ChipComponent>
            </div>

            <DividerComponent class="my-3" />

            <div class="metric-row">
              <div class="metric-label">Responsável</div>
              <span class="metric-value text-body-2">{{ tarefa.user_tratamento ?? '—' }}</span>
            </div>

            <DividerComponent class="my-3" />

            <div class="metric-row">
              <div class="metric-label">Aging</div>
              <ChipComponent
                :color="(tarefa.aging_tarefa ?? 0) > 30 ? 'error' : (tarefa.aging_tarefa ?? 0) > 15 ? 'warning' : 'success'"
                size="small"
                variant="tonal"
              >
                {{ tarefa.aging_tarefa ?? 0 }} dia{{ tarefa.aging_tarefa !== 1 ? 's' : '' }}
              </ChipComponent>
            </div>

            <DividerComponent class="my-3" />

            <div class="metric-row">
              <div class="metric-label">Prioridade</div>
              <ChipComponent
                :color="corPrioridade(tarefa.prioridade)"
                size="small"
                variant="tonal"
                label
              >
                {{ tarefa.prioridade ?? '—' }}
              </ChipComponent>
            </div>

            <DividerComponent class="my-3" />

            <div class="metric-row">
              <div class="metric-label">Tratamentos</div>
              <span class="metric-value">{{ tratamentos.length }}</span>
            </div>

          </CardTextComponent>
        </CardComponent>
      </ColComponent>

    </RowComponent>

    <!-- Histórico de Tratamentos -->
    <div class="mt-6">
      <div class="d-flex align-center gap-3 mb-3">
        <div class="text-subtitle-1 font-weight-bold">Histórico de Tratamentos</div>
        <SpacerComponent />
        <ButtonComponent size="small" variant="text" color="primary" :loading="carregandoTratamentos" @click="carregarTratamentos">
          <IconComponent start>mdi-refresh</IconComponent>
          Atualizar
        </ButtonComponent>
      </div>

      <CardComponent rounded="xl" variant="elevated">
        <v-data-table
          :headers="headersTratamentos"
          :items="tratamentos"
          :items-per-page="10"
          :loading="carregandoTratamentos"
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

  </ContainerComponent>

  <!-- Dialog: Registrar Tratamento -->
  <DialogComponent
    v-if="dialogTratamento"
    v-model="dialogTratamento"
    max-width="560px"
    @keydown.esc="fecharDialogTratamento"
  >
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">mdi-clipboard-edit-outline</IconComponent>
        <span class="text-h6">Registrar Tratamento</span>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="fecharDialogTratamento" />
      </CardTitleComponent>

      <CardTextComponent class="pt-5 pb-2 px-6">
        <div class="text-caption text-medium-emphasis mb-4">
          {{ tarefa?.tarefa }} · {{ tarefa?.processo }}
        </div>

        <SelectComponent
          v-model="formTratamento.ctrl_status_id"
          label="Status"
          :items="opcoesStatus"
          :loading="carregandoStatus"
          :rules="[v => !!v || 'Status é obrigatório']"
          clearable
          class="mb-4"
        />

        <TextAreaComponent
          v-model="formTratamento.comentario"
          label="Comentário"
          rows="4"
          auto-grow
          counter
          maxlength="1000"
          variant="outlined"
          density="comfortable"
        />
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <SpacerComponent />
        <ButtonComponent variant="text" @click="fecharDialogTratamento">Cancelar</ButtonComponent>
        <ButtonComponent
          color="primary"
          variant="flat"
          :loading="salvandoTratamento"
          :disabled="!formTratamento.ctrl_status_id"
          @click="salvarTratamento"
        >
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>

  <SnackbarComponent v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top">
    {{ snackbar.message }}
    <template #actions>
      <ButtonComponent variant="text" color="white" size="small" @click="snackbar.show = false">
        Fechar
      </ButtonComponent>
    </template>
  </SnackbarComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'
import { useCrud } from '@/services/useCrud.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'
import DialogComponent from '@/components/comuns/dialogs/DialogComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import TextAreaComponent from '@/components/comuns/forms/TextAreaComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'

const route  = useRoute()
const router = useRouter()

const { index: fetchStatus } = useCrud('wf/status')

const tarefa          = ref(null)
const carregando      = ref(true)
const naoEncontrado   = ref(false)

const tratamentos          = ref([])
const carregandoTratamentos = ref(false)

const snackbar = ref({ show: false, message: '', color: 'success' })

const headersTratamentos = [
  { title: 'Data',         value: 'created_at',   sortable: true },
  { title: 'Status',       value: 'status',        sortable: true },
  { title: 'Responsável',  value: 'usuario',       sortable: true },
  { title: 'Comentário',   value: 'comentario',    sortable: false },
]

function corPrioridade(prioridade) {
  const map = { alta: 'error', media: 'warning', média: 'warning', baixa: 'success' }
  return map[(prioridade ?? '').toLowerCase()] ?? 'default'
}

function formatarData(val) {
  if (!val) return '—'
  const [y, m, d] = val.split('-')
  return `${d}/${m}/${y}`
}

function formatarDataHora(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function carregarFicha() {
  carregando.value = true
  try {
    const res = await api.get(`wf/projetos/ficha-tecnica-tarefa/${route.params.id}`)
    const data = res.data?.data
    tarefa.value = Array.isArray(data) ? (data[0] ?? null) : (data ?? null)
    if (!tarefa.value) naoEncontrado.value = true
  } catch {
    naoEncontrado.value = true
  } finally {
    carregando.value = false
  }
}

async function carregarTratamentos() {
  carregandoTratamentos.value = true
  try {
    const res = await api.get(`wf/pco-tarefas/${route.params.id}/tratamentos`)
    tratamentos.value = res.data?.data ?? []
  } catch {
    tratamentos.value = []
  } finally {
    carregandoTratamentos.value = false
  }
}

// --- Dialog: Novo Tratamento ---
const dialogTratamento    = ref(false)
const salvandoTratamento  = ref(false)
const carregandoStatus    = ref(false)
const opcoesStatus        = ref([])

const formTratamento = ref({ ctrl_status_id: null, comentario: '' })

async function abrirDialogTratamento() {
  formTratamento.value = { ctrl_status_id: null, comentario: '' }
  dialogTratamento.value = true

  if (opcoesStatus.value.length === 0) {
    carregandoStatus.value = true
    try {
      const data = await fetchStatus()
      opcoesStatus.value = (data ?? []).map(s => ({ value: s.id, text: s.status ?? String(s.id) }))
    } finally {
      carregandoStatus.value = false
    }
  }
}

function fecharDialogTratamento() {
  dialogTratamento.value = false
  setTimeout(() => {
    formTratamento.value = { ctrl_status_id: null, comentario: '' }
  }, 300)
}

async function salvarTratamento() {
  salvandoTratamento.value = true
  try {
    await api.post('wf/tratamentos', {
      pco_tarefa_id:   Number(route.params.id),
      ctrl_status_id:  formTratamento.value.ctrl_status_id,
      comentario:      formTratamento.value.comentario || null,
    })
    snackbar.value = { show: true, message: 'Tratamento registrado com sucesso!', color: 'success' }
    fecharDialogTratamento()
    await Promise.all([carregarFicha(), carregarTratamentos()])
  } catch {
    snackbar.value = { show: true, message: 'Erro ao registrar tratamento.', color: 'error' }
  } finally {
    salvandoTratamento.value = false
  }
}

onMounted(async () => {
  await carregarFicha()
  // if (!naoEncontrado.value) await carregarTratamentos()
})
</script>

<style scoped>
.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.55;
}

.field-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  margin-bottom: 2px;
}

.field-value {
  font-size: 0.925rem;
  font-weight: 500;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.metric-label {
  font-size: 0.82rem;
  opacity: 0.7;
}

.metric-value {
  font-weight: 700;
  font-size: 1rem;
}

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
