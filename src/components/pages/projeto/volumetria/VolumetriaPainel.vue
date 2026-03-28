<template>
  <ContainerComponent fluid class="py-4">
    <div class="d-flex align-center mb-4 gap-2">
      <span class="text-caption text-medium-emphasis font-weight-medium">Exibir:</span>
      <v-btn-toggle v-model="statusFiltro" mandatory density="compact" rounded="lg" color="primary">
        <v-btn value="aberto" size="small">Aberto</v-btn>
        <v-btn value="finalizado" size="small">Finalizado</v-btn>
        <v-btn value="todos" size="small">Todos</v-btn>
      </v-btn-toggle>
    </div>

    <div class="row-one">
      <CardComponent
          v-for="(item, idx) in cards"
          :key="keyOf(item, idx)"
          class="compact"
          :class="{ 'card-clicavel': idx !== 0, 'card-selecionado': cardSelecionado?.id === item.id && idx !== 0 }"
          rounded="xl"
          variant="elevated"
          @click="idx !== 0 ? selecionarCard(item) : null"
      >
        <CardTextComponent>
          <div class="header">
            <div class="badge" :class="{ total: idx === 0 }">
              {{ idx === 0 ? 'TOTAL' : `MP ${item.id}` }}
            </div>
            <div class="pct">{{ porcentagemText(item) }}</div>
          </div>

          <div class="name">
            {{ idx === 0 ? 'Totalizador' : item.processo }}
          </div>

          <div class="grid">
            <div>
              <div class="k">Quantidade</div>
              <div class="v">{{ Number(item.quantidade ?? 0) }}</div>
            </div>

            <div>
              <div class="k">Registros</div>
              <div class="v2">{{ statusFiltro }}</div>
            </div>
          </div>

          <DividerComponent class="my-3" />

          <div class="d-flex align-center justify-space-between">
            <div class="text-caption text-medium-emphasis">Progresso</div>
            <div class="text-caption font-weight-bold">{{ porcentagemText(item) }}</div>
          </div>

          <ProgressLinearComponent
              :model-value="porcentagem(item)"
              height="8"
              rounded
              :color="idx === 0 ? 'primary' : (cardSelecionado?.id === item.id ? 'secondary' : 'secondary')"
          />
        </CardTextComponent>
      </CardComponent>
    </div>

    <div v-if="cardSelecionado" class="mt-6">
      <CardComponent rounded="xl" variant="elevated">
        <CardTextComponent>
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ cardSelecionado.processo }}</div>
              <div class="text-caption text-medium-emphasis">Expanda os processos para ver os sub-níveis e tarefas</div>
            </div>
            <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="cardSelecionado = null"
            />
          </div>

          <v-data-table
              :headers="headersDetalhe"
              :items="detalheProcessos"
              :loading="loadingDetalhe"
              :items-per-page="10"
              v-model:expanded="expandidos"
              item-value="id"
              class="elevation-0 rounded-lg tabela-drill"
              hover
              @click:row="clicarLinha"
          >
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@5" />
            </template>
            <template v-slot:no-data>
              <div class="text-center pa-6 text-medium-emphasis">
                Nenhum processo encontrado para este macroprocesso.
              </div>
            </template>

            <template v-slot:item.expand-icon="{ item }">
              <v-icon
                  size="small"
                  class="chevron"
                  :class="{ 'chevron-aberto': expandidos.includes(item.id) }"
              >mdi-chevron-right</v-icon>
            </template>

            <template v-slot:expanded-row="{ item, columns }">
              <tr>
                <td :colspan="columns.length" class="pa-0">
                  <div class="sub-tabela-wrapper">
                    <div v-if="loadingSub[item.id]" class="py-3 px-6">
                      <v-progress-linear indeterminate color="secondary" rounded height="3" />
                    </div>
                    <div
                        v-else-if="subDados[item.id]?.length === 0"
                        class="text-center pa-4 text-caption text-medium-emphasis"
                    >
                      Nenhum subprocesso encontrado.
                    </div>
                    <v-data-table
                        v-else-if="subDados[item.id]"
                        :headers="headersParaSub(item.id)"
                        :items="subDados[item.id]"
                        :items-per-page="-1"
                        hide-default-footer
                        class="elevation-0 sub-tabela"
                        density="compact"
                    >
                      <template v-if="subTipos[item.id] === 'tarefa'" v-slot:item.id="{ item: tarefa }">
                        <a :href="`/fila-tarefa/${tarefa.id}`" target="_blank" class="link-fila">
                          {{ tarefa.id }}
                        </a>
                      </template>
                    </v-data-table>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </CardTextComponent>
      </CardComponent>
    </div>
  </ContainerComponent>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import ProgressLinearComponent from "@/components/comuns/progress/ProgressLinearComponent.vue"
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue"
import CardComponent from "@/components/comuns/cards/CardComponent.vue"
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue"
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import api from "@/services/api.js"

const WORKFLOW_ID = 1

const statusFiltro = ref('aberto')
const hierarquiaRaizId = ref(null)

const dadosPainel = ref([])
const cardSelecionado = ref(null)
const detalheProcessos = ref([])
const loadingDetalhe = ref(false)
const expandidos = ref([])
const subDados = ref({})   // { [id]: item[] }
const subTipos = ref({})   // { [id]: 'processo' | 'tarefa' }
const loadingSub = ref({})

const headersDetalhe = [
  { title: '', value: 'expand-icon', width: '40px', sortable: false },
  { title: 'ID', value: 'id', width: '80px' },
  { title: 'Processo', value: 'processo' },
  { title: 'Quantidade', value: 'quantidade', width: '130px' },
]

const headersSubProcesso = [
  { title: 'ID', value: 'id', width: '80px' },
  { title: 'Processo', value: 'processo' },
  { title: 'Quantidade', value: 'quantidade', width: '130px' },
]

const headersSubTarefa = [
  { title: 'ID', value: 'id', width: '80px' },
  { title: 'Tarefa', value: 'tarefa' },
  { title: 'Quantidade', value: 'quantidade', width: '130px' },
]

function headersParaSub(id) {
  return subTipos.value[id] === 'tarefa' ? headersSubTarefa : headersSubProcesso
}

const cards = computed(() => {
  const items = dadosPainel.value ?? []
  const total = items.find(x => x?.total) ?? { total: 'total', quantidade: 0 }
  const list = items.filter(x => x?.id).slice(0, 6)
  return [total, ...list]
})

const totalQtd = computed(() => Number(cards.value?.[0]?.quantidade ?? 0) || 0)

function keyOf(item, idx) {
  return item?.total ? 'total' : (item?.id ?? idx)
}

function porcentagem(item) {
  const t = totalQtd.value
  const q = Number(item?.quantidade ?? 0) || 0
  if (!t) return 0
  return Math.min(100, Math.round((q / t) * 100))
}

function porcentagemText(item) {
  return `${porcentagem(item)}%`
}

async function carregarVolumetria(hierarquiaId) {
  const res = await api.post('/wf/processos/volumetria-backlog', {
    ctrl_workflow_id: WORKFLOW_ID,
    ctrl_hierarquia_id: hierarquiaId,
    status: statusFiltro.value,
  })

  dadosPainel.value = []
  const total = { quantidade: 0, total: 0 }
  dadosPainel.value.push(total)
  res.data.data.forEach((item) => {
    dadosPainel.value.push(item)
    total.total += item.quantidade
    total.quantidade += item.quantidade
  })
}

async function selecionarCard(item) {
  if (cardSelecionado.value?.id === item.id) return
  cardSelecionado.value = item
  detalheProcessos.value = []
  expandidos.value = []
  subDados.value = {}
  loadingSub.value = {}
  loadingDetalhe.value = true

  try {
    const res = await api.post('/wf/processos/volumetria-backlog', {
      ctrl_workflow_id: WORKFLOW_ID,
      ctrl_processo_id: item.id,
      status: statusFiltro.value,
    })
    detalheProcessos.value = res.data.data ?? []
  } finally {
    loadingDetalhe.value = false
  }
}

async function clicarLinha(event, { item }) {
  const id = item.id
  const idx = expandidos.value.indexOf(id)

  if (idx !== -1) {
    expandidos.value.splice(idx, 1)
    return
  }

  expandidos.value.push(id)

  if (subDados.value[id] !== undefined) return

  loadingSub.value = { ...loadingSub.value, [id]: true }
  try {
    const res = await api.post('/wf/processos/volumetria-backlog', {
      ctrl_workflow_id: WORKFLOW_ID,
      ctrl_processo_id: id,
      status: statusFiltro.value,
    })
    const items = res.data.data ?? []
    const tipo = items.length > 0 && items[0].tarefa !== undefined ? 'tarefa' : 'processo'
    subTipos.value = { ...subTipos.value, [id]: tipo }
    subDados.value = { ...subDados.value, [id]: items }
  } finally {
    loadingSub.value = { ...loadingSub.value, [id]: false }
  }
}

watch(statusFiltro, () => {
  cardSelecionado.value = null
  detalheProcessos.value = []
  expandidos.value = []
  subDados.value = {}
  subTipos.value = {}
  loadingSub.value = {}
  if (hierarquiaRaizId.value) carregarVolumetria(hierarquiaRaizId.value)
})

onMounted(async () => {
  const resHierarquias = await api.get('/wf/hierarquias', {
    params: { ctrl_workflow_id: WORKFLOW_ID },
  })

  const hierarquias = resHierarquias.data.data ?? []
  const raiz = hierarquias.find(h => h.ctrl_macro_hierarquia_id === null)

  if (!raiz) return

  hierarquiaRaizId.value = raiz.id
  await carregarVolumetria(raiz.id)
})
</script>

<style scoped>
.row-one {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.compact {
  flex: 1 1 0;
  min-width: 240px;
  max-width: 360px;
}

.card-clicavel {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card-clicavel:hover {
  transform: translateY(-2px);
}

.card-selecionado {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 2px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .06em;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--v-theme-secondary), .14);
  color: rgba(var(--v-theme-secondary), 1);
}

.badge.total {
  background: rgba(var(--v-theme-primary), .14);
  color: rgba(var(--v-theme-primary), 1);
}

.pct {
  font-size: 12px;
  font-weight: 800;
  opacity: .85;
}

.name {
  margin-top: 10px;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.k { font-size: 12px; opacity: .7; }
.v { font-size: 26px; font-weight: 900; line-height: 1.1; }
.v2 { font-size: 14px; font-weight: 700; opacity: .9; }

.tabela-drill :deep(tbody tr) {
  cursor: pointer;
}

.chevron {
  transition: transform 0.2s ease;
  opacity: 0.4;
}

.chevron-aberto {
  transform: rotate(90deg);
  opacity: 1;
  color: rgb(var(--v-theme-secondary));
}

.sub-tabela-wrapper {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-left: 3px solid rgb(var(--v-theme-secondary));
}

.sub-tabela {
  background: transparent !important;
}

.link-fila {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  text-decoration: none;
}

.link-fila:hover {
  text-decoration: underline;
}
</style>
