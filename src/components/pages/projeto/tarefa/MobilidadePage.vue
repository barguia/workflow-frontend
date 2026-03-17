<template>
  <!-- Carregando -->
  <ContainerComponent v-if="carregando" class="fill-height d-flex align-center justify-center" fluid>
    <ProgressCircularComponent indeterminate color="primary" size="48" />
  </ContainerComponent>

  <ContainerComponent v-else fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center gap-3 mb-4">
      <ButtonComponent icon="mdi-arrow-left" variant="text" size="small" @click="router.back()" />
      <div>
        <div class="d-flex align-center gap-2">
          <IconComponent color="primary" size="20">mdi-transit-connection-variant</IconComponent>
          <span class="text-h6 font-weight-bold">Mobilidade da Tarefa</span>
        </div>
        <div v-if="tarefa" class="text-caption text-medium-emphasis mt-1">
          {{ tarefa.tarefa }} · {{ tarefa.processo?.processo }}
        </div>
      </div>
      <v-spacer />
      <ButtonComponent
        color="primary"
        :loading="salvando"
        :disabled="!houveMudanca"
        @click="salvar"
      >
        <IconComponent start>mdi-content-save-outline</IconComponent>
        Salvar
      </ButtonComponent>
    </div>

    <!-- Detalhes da tarefa -->
    <CardComponent rounded="xl" variant="elevated" class="mb-4">
      <CardTextComponent class="pa-4">
        <RowComponent dense>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Tarefa</div>
            <div class="field-value">{{ tarefa?.tarefa ?? '—' }}</div>
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Processo</div>
            <div class="field-value">{{ tarefa?.processo?.processo ?? '—' }}</div>
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Workflow</div>
            <div class="field-value">{{ tarefa?.workflow?.workflow ?? '—' }}</div>
          </ColComponent>
        </RowComponent>
      </CardTextComponent>
    </CardComponent>

    <!-- Painéis de mobilidade -->
    <RowComponent>

      <!-- Origens: de onde pode vir -->
      <ColComponent cols="12" md="6">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-0">
            <div class="painel-header pa-4 d-flex align-center gap-2">
              <IconComponent color="success" size="20">mdi-arrow-collapse-right</IconComponent>
              <span class="text-subtitle-1 font-weight-bold">De onde pode vir</span>
              <v-spacer />
              <v-chip size="small" color="success" variant="tonal">
                {{ origensLocal.length }} selecionada{{ origensLocal.length !== 1 ? 's' : '' }}
              </v-chip>
            </div>

            <v-divider />

            <div class="pa-4">
              <div v-if="grupos.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
                Nenhuma tarefa disponível.
              </div>

              <div v-for="grupo in grupos" :key="grupo.grupo" class="mb-5">
                <div class="grupo-titulo mb-1">{{ grupo.grupo }}</div>
                <v-divider class="mb-2" />
                <v-checkbox
                  v-for="opcao in grupo.options"
                  :key="opcao.value"
                  v-model="origensLocal"
                  :value="opcao.value"
                  hide-details
                  density="compact"
                  color="success"
                  class="my-1"
                  :disabled="opcao.value === tarefaId"
                >
                  <template #label>
                    <v-chip
                      :color="origensLocal.includes(opcao.value) ? 'success' : undefined"
                      size="small"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ opcao.text }}
                    </v-chip>
                  </template>
                </v-checkbox>
              </div>
            </div>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

      <!-- Destinos: para onde pode ir -->
      <ColComponent cols="12" md="6">
        <CardComponent rounded="xl" variant="elevated" height="100%">
          <CardTextComponent class="pa-0">
            <div class="painel-header pa-4 d-flex align-center gap-2">
              <IconComponent color="primary" size="20">mdi-arrow-expand-right</IconComponent>
              <span class="text-subtitle-1 font-weight-bold">Para onde pode ir</span>
              <v-spacer />
              <v-chip size="small" color="primary" variant="tonal">
                {{ destinosLocal.length }} selecionado{{ destinosLocal.length !== 1 ? 's' : '' }}
              </v-chip>
            </div>

            <v-divider />

            <div class="pa-4">
              <div v-if="grupos.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
                Nenhuma tarefa disponível.
              </div>

              <div v-for="grupo in grupos" :key="grupo.grupo" class="mb-5">
                <div class="grupo-titulo mb-1">{{ grupo.grupo }}</div>
                <v-divider class="mb-2" />
                <v-checkbox
                  v-for="opcao in grupo.options"
                  :key="opcao.value"
                  v-model="destinosLocal"
                  :value="opcao.value"
                  hide-details
                  density="compact"
                  color="primary"
                  class="my-1"
                  :disabled="opcao.value === tarefaId"
                >
                  <template #label>
                    <v-chip
                      :color="destinosLocal.includes(opcao.value) ? 'primary' : undefined"
                      size="small"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ opcao.text }}
                    </v-chip>
                  </template>
                </v-checkbox>
              </div>
            </div>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

    </RowComponent>

  </ContainerComponent>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'

const route  = useRoute()
const router = useRouter()

const tarefaId = computed(() => Number(route.params.id))

const carregando = ref(true)
const salvando   = ref(false)

const tarefa        = ref(null)
const grupos        = ref([])      // [{ grupo: string, options: [{ value, text }] }]
const origensLocal  = ref([])
const destinosLocal = ref([])
const origensOriginal  = ref([])
const destinosOriginal = ref([])

const snackbar = ref({ show: false, message: '', color: 'success' })

const houveMudanca = computed(() => {
  const sortIds = arr => [...arr].sort((a, b) => a - b)
  return (
    JSON.stringify(sortIds(origensLocal.value))  !== JSON.stringify(sortIds(origensOriginal.value)) ||
    JSON.stringify(sortIds(destinosLocal.value)) !== JSON.stringify(sortIds(destinosOriginal.value))
  )
})

async function carregar() {
  carregando.value = true
  try {
    const [resTarefa, resMobilidade] = await Promise.all([
      api.get(`wf/tarefas/${tarefaId.value}`),
      api.get(`wf/tarefa-mobilidades/${tarefaId.value}`),
    ])

    tarefa.value = resTarefa.data?.data ?? null

    const mobilidade = resMobilidade.data?.data ?? {}

    // Monta grupos agrupados por processo a partir das tarefas disponíveis
    const todasTarefas = mobilidade.tarefas_disponiveis ?? []
    const agrupado = {}
    todasTarefas.forEach(t => {
      const nomeGrupo = t.processo ?? 'Sem processo'
      if (!agrupado[nomeGrupo]) agrupado[nomeGrupo] = []
      agrupado[nomeGrupo].push({ value: t.id, text: t.tarefa })
    })
    grupos.value = Object.entries(agrupado).map(([grupo, options]) => ({ grupo, options }))

    // Pré-seleciona origens e destinos já configurados
    const origens  = (mobilidade.origens  ?? []).map(t => t.id ?? t)
    const destinos = (mobilidade.destinos ?? []).map(t => t.id ?? t)
    origensLocal.value    = origens
    destinosLocal.value   = destinos
    origensOriginal.value  = [...origens]
    destinosOriginal.value = [...destinos]

  } finally {
    carregando.value = false
  }
}

async function salvar() {
  salvando.value = true
  try {
    await api.post(`wf/tarefa-mobilidades/${tarefaId.value}`, {
      origens:  origensLocal.value,
      destinos: destinosLocal.value,
    })
    origensOriginal.value  = [...origensLocal.value]
    destinosOriginal.value = [...destinosLocal.value]
    snackbar.value = { show: true, message: 'Mobilidade salva com sucesso!', color: 'success' }
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
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

.painel-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.grupo-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
}
</style>
