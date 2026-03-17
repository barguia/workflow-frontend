<template>
  <!-- 404 -->
  <ContainerComponent v-if="naoEncontrado" class="fill-height d-flex align-center justify-center text-center" fluid>
    <div>
      <IconComponent size="72" color="error">mdi-file-alert-outline</IconComponent>
      <div class="text-h5 font-weight-bold mt-4">Registro não encontrado</div>
      <p class="text-body-1 mt-2 text-medium-emphasis">
        O projeto com ID <strong>#{{ route.params.id }}</strong> não existe ou foi removido.
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
  <ContainerComponent v-else-if="projeto" fluid class="py-4">

    <!-- Cabeçalho da página -->
    <div class="d-flex align-center gap-3 mb-4">
      <ButtonComponent icon="mdi-arrow-left" variant="text" size="small" @click="router.back()" />
      <div class="flex-1-1">
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="text-h6 font-weight-bold">{{ projeto.nome }}</span>
          <v-chip
            :color="corPrioridade(projeto.prioridade)"
            size="small"
            variant="tonal"
            label
          >
            {{ projeto.prioridade }}
          </v-chip>
        </div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ projeto.workflow?.ctrl_workflow?.workflow }} · Projeto #{{ projeto.id }}
        </div>
      </div>
    </div>

    <RowComponent dense>

      <!-- Detalhes do Projeto + Workflow -->
      <ColComponent cols="12" md="8">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-5">
            <div class="section-label mb-3">Detalhes do Projeto</div>

            <RowComponent dense>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Nome</div>
                <div class="field-value">{{ projeto.nome }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Prioridade</div>
                <div class="field-value">
                  <v-chip :color="corPrioridade(projeto.prioridade)" size="small" variant="tonal" label>
                    {{ projeto.prioridade }}
                  </v-chip>
                </div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Data de Início</div>
                <div class="field-value">{{ formatarData(projeto.data_inicio) }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Data de Término</div>
                <div class="field-value">{{ formatarData(projeto.data_fim) }}</div>
              </ColComponent>
              <ColComponent v-if="projeto.duracao" cols="12" sm="6">
                <div class="field-label">Duração</div>
                <div class="field-value">{{ projeto.duracao }}</div>
              </ColComponent>
              <ColComponent v-if="projeto.descricao" cols="12">
                <div class="field-label">Descrição</div>
                <div class="field-value">{{ projeto.descricao }}</div>
              </ColComponent>
            </RowComponent>

            <v-divider class="my-4" />

            <div class="section-label mb-3">Workflow</div>
            <RowComponent dense>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Tipo de Workflow</div>
                <div class="field-value">{{ projeto.workflow?.ctrl_workflow?.workflow ?? '—' }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Aging (dias)</div>
                <div class="field-value">
                  <v-chip
                    :color="projeto.workflow?.aging > 30 ? 'error' : projeto.workflow?.aging > 15 ? 'warning' : 'success'"
                    size="small"
                    variant="tonal"
                  >
                    {{ projeto.workflow?.aging ?? 0 }} dia{{ projeto.workflow?.aging !== 1 ? 's' : '' }}
                  </v-chip>
                </div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Criado em</div>
                <div class="field-value">{{ formatarDataHora(projeto.workflow?.created_at) }}</div>
              </ColComponent>
              <ColComponent cols="12" sm="6">
                <div class="field-label">Finalizado em</div>
                <div class="field-value">{{ projeto.workflow?.finalized_at ? formatarDataHora(projeto.workflow.finalized_at) : '—' }}</div>
              </ColComponent>
            </RowComponent>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

      <!-- Painel lateral de métricas -->
      <ColComponent cols="12" md="4">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-5">
            <div class="section-label mb-3">Resumo</div>
            <div class="metric-row">
              <div class="metric-label">Status do projeto</div>
              <v-chip
                :color="projeto.workflow?.finalized_at ? 'success' : 'primary'"
                size="small"
                variant="tonal"
              >
                {{ projeto.workflow?.finalized_at ? 'Finalizado' : 'Em andamento' }}
              </v-chip>
            </div>
            <v-divider class="my-3" />
            <div class="metric-row">
              <div class="metric-label">Tarefas abertas</div>
              <span class="metric-value">{{ totalTarefas }}</span>
            </div>
            <div class="metric-row mt-2">
              <div class="metric-label">Criado por</div>
              <span class="metric-value text-body-2">Usuário #{{ projeto.user_id }}</span>
            </div>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

    </RowComponent>

    <!-- Tarefas -->
    <div class="mt-6">
      <div class="d-flex align-center gap-3 mb-3 flex-wrap">
        <div class="text-subtitle-1 font-weight-bold">Tarefas</div>
        <v-spacer />
        <v-btn-toggle
          v-model="modoTarefas"
          mandatory
          rounded="pill"
          color="primary"
          density="compact"
          @update:model-value="buscarTarefas"
        >
          <ButtonComponent value="pendentes" size="small" prepend-icon="mdi-clock-outline">Pendentes</ButtonComponent>
          <ButtonComponent value="finalizados" size="small" prepend-icon="mdi-check-circle-outline">Finalizadas</ButtonComponent>
        </v-btn-toggle>
        <ButtonComponent size="small" variant="tonal" color="primary" :loading="carregandoTarefas" @click="buscarTarefas">
          <IconComponent start>mdi-refresh</IconComponent>
          Atualizar
        </ButtonComponent>
      </div>

      <CardComponent rounded="xl" variant="elevated">
        <v-data-table
          :headers="headersTarefas"
          :items="tarefas"
          :items-per-page="10"
          :loading="carregandoTarefas"
          class="elevation-0"
          hover
        >
          <template #top>
            <div class="table-toolbar pa-4 d-flex align-center ga-3">
              <span class="text-subtitle-2 font-weight-semibold">
                {{ modoTarefas === 'pendentes' ? 'Tarefas Pendentes' : 'Tarefas Finalizadas' }}
                <v-chip size="x-small" color="primary" class="ml-2">{{ tarefas.length }}</v-chip>
              </span>
              <v-spacer />
              <TextFieldComponent
                v-model="buscaTarefa"
                prepend-inner-icon="mdi-magnify"
                label="Buscar"
                single-line
                hide-details
                density="compact"
                style="max-width: 260px"
                clearable
              />
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip size="small" variant="tonal" color="primary">
              {{ item.status ?? '—' }}
            </v-chip>
          </template>

          <template #no-data>
            <div class="py-8 text-center text-medium-emphasis">
              <IconComponent size="40" class="mb-2">mdi-inbox-outline</IconComponent>
              <div>Nenhuma tarefa {{ modoTarefas === 'pendentes' ? 'pendente' : 'finalizada' }} encontrada.</div>
            </div>
          </template>
        </v-data-table>
      </CardComponent>
    </div>

  </ContainerComponent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'

const route  = useRoute()
const router = useRouter()

const projeto         = ref(null)
const carregando      = ref(true)
const naoEncontrado   = ref(false)

const tarefas          = ref([])
const carregandoTarefas = ref(false)
const modoTarefas      = ref('pendentes')
const buscaTarefa      = ref('')

const totalTarefas = computed(() => tarefas.value.length)

const headersTarefas = [
  { title: 'Processo',   value: 'processo',  sortable: true },
  { title: 'tarefa',     value: 'tarefa',    sortable: true },
  { title: 'Status',     value: 'status',    sortable: true },
  { title: 'Responsável', value: 'responsavel', sortable: true },
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
    const res = await api.get(`wf/projetos/ficha-tecnica/${route.params.id}`)
    projeto.value = res.data.data
  } catch (err) {
    if (err?.type === 'server' || err?.response?.status === 404 || err === undefined) {
      naoEncontrado.value = true
    } else {
      naoEncontrado.value = true
    }
  } finally {
    carregando.value = false
  }
}

async function buscarTarefas() {
  if (!projeto.value) return
  carregandoTarefas.value = true
  try {
    const payload = {
      modo:          modoTarefas.value,
      pco_projeto_id: [projeto.value.id],
    }
    const res = await api.post('wf/projetos/pesquisa', payload)
    tarefas.value = res.data?.data ?? []
  } catch {
    tarefas.value = []
  } finally {
    carregandoTarefas.value = false
  }
}

onMounted(async () => {
  await carregarFicha()
  if (projeto.value) {
    await buscarTarefas()
  }
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
