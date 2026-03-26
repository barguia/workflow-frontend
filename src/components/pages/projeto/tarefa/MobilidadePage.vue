<template>
  <!-- Carregando -->
  <ContainerComponent v-if="carregando" class="fill-height d-flex align-center justify-center" fluid>
    <ProgressCircularComponent indeterminate color="primary" size="48" />
  </ContainerComponent>

  <ContainerComponent v-else fluid class="py-4">

    <!-- Cabeçalho -->
    <div class="d-flex align-center gap-3 mb-4">
      <div>
        <div class="d-flex align-center gap-2">
          <IconComponent color="primary" size="20">mdi-transit-connection-variant</IconComponent>
          <span class="text-h6 font-weight-bold">Mobilidade da Tarefa</span>
        </div>
        <div v-if="tarefa" class="text-h5 font-weight-bold text-medium-emphasis mt-1">
          {{ tarefa.tarefa }} · {{ tarefa.processo?.processo }}
        </div>
      </div>
      <SpacerComponent />
      <ButtonComponent
        color="secondary"
        variant="tonal"
        @click="abrirDialogAssociacao"
      >
        <IconComponent start>mdi-link-variant</IconComponent>
        Associar
      </ButtonComponent>
    </div>

    <!-- Funil de navegação entre tarefas -->
    <CardComponent rounded="xl" variant="outlined" class="mb-4">
      <CardTextComponent class="pa-3">
        <div class="text-caption text-medium-emphasis mb-2 d-flex align-center gap-1">
          <IconComponent size="14">mdi-swap-horizontal</IconComponent>
          Navegar para outra tarefa
        </div>
        <RowComponent dense>
          <ColComponent cols="12" sm="4">
            <SelectComponent
              v-model="funilMacro"
              :items="opsMacro"
              item-title="nome"
              item-value="id"
              label="Macro processo"
              clearable
              hide-details
              density="compact"
            />
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <SelectComponent
              v-model="funilProcesso"
              :items="opsProcesso"
              item-title="nome"
              item-value="id"
              label="Processo"
              clearable
              hide-details
              density="compact"
            />
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <SelectComponent
              v-model="funilTarefa"
              :items="opsTarefa"
              item-title="nome"
              item-value="id"
              label="Selecionar tarefa"
              clearable
              hide-details
              density="compact"
            />
          </ColComponent>
        </RowComponent>
      </CardTextComponent>
    </CardComponent>

    <!-- Detalhes da tarefa -->
    <CardComponent rounded="xl" variant="elevated" class="mb-4">
      <CardTextComponent class="pa-4">
        <RowComponent dense>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Tarefa</div>
            <div class="field-value">Ordem: {{ tarefa?.ordenacao ?? 0 }}. {{ tarefa?.tarefa ?? '—' }}</div>
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Processo</div>
            <div class="field-value">Ordem: {{ tarefa?.processo?.ordenacao ?? 0 }}. {{ tarefa?.processo?.processo ?? '—' }}</div>
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
            </div>

            <DividerComponent />

            <div class="pa-4">
              <div v-if="gruposOrigens.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
                Nenhuma tarefa associada.
              </div>

              <div v-for="grupo in gruposOrigens" :key="grupo.grupo" class="mb-5">
                <div class="grupo-titulo-pai mb-0" v-if="grupo.processo_pai">Ordem: {{ grupo.ordenacao_pai }}. {{ grupo.processo_pai }}</div>
                <div class="grupo-titulo mb-1">Ordem: {{ grupo.ordenacao }}. {{ grupo.grupo }}</div>
                <DividerComponent class="mb-2" />
                <div class="d-flex flex-column gap-2 mt-2">
                  <div v-for="opcao in grupo.options" :key="opcao.value">
                    <ChipComponent
                      color="success"
                      size="small"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      Ordem: {{ opcao.ordenacao }}. {{ opcao.text }}
                    </ChipComponent>
                  </div>
                </div>
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
            </div>

            <DividerComponent />

            <div class="pa-4">
              <div v-if="gruposDestinos.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
                Nenhuma tarefa associada.
              </div>

              <div v-for="grupo in gruposDestinos" :key="grupo.grupo" class="mb-5">
                <div class="grupo-titulo-pai mb-0" v-if="grupo.processo_pai">Ordem: {{ grupo.ordenacao_pai }}. {{ grupo.processo_pai }}</div>
                <div class="grupo-titulo mb-1">Ordem: {{ grupo.ordenacao_pai }}.{{ grupo.ordenacao }}. {{ grupo.grupo }}</div>
                <DividerComponent class="mb-2" />
                <div class="d-flex flex-column mt-2">
                  <div
                    v-for="opcao in grupo.options"
                    :key="opcao.value"
                    class="d-flex align-center gap-4 mb-3"
                  >
                    <ChipComponent
                      color="primary"
                      size="small"
                      variant="tonal"
                      class="font-weight-medium flex-grow-1"
                      style="min-width: 0"
                    >
                      Ordem: {{ opcao.ordenacao }}. {{ opcao.text }}
                    </ChipComponent>
                    <ChipComponent
                      v-if="opcao.is_interrupcao"
                      color="warning"
                      size="small"
                      variant="tonal"
                      class="flex-shrink-0 font-weight-medium"
                    >
                      <IconComponent start size="14">mdi-lightning-bolt</IconComponent>
                      Interrupção
                    </ChipComponent>
                    <v-btn-toggle
                      v-else
                      :model-value="opcao.tipo_id"
                      density="compact"
                      variant="outlined"
                      rounded="lg"
                      class="flex-shrink-0"
                      @update:model-value="val => atualizarTipo(opcao.mobilidade_id, val)"
                    >
                      <ButtonComponent
                        v-for="tipo in tiposMobilidade"
                        :key="tipo.id"
                        :value="tipo.id"
                        size="x-small"
                        :color="corTipo(tipo.tipo)"
                        :loading="atualizandoTipo === opcao.mobilidade_id"
                      >
                        {{ tipo.tipo }}
                      </ButtonComponent>
                    </v-btn-toggle>
                  </div>
                </div>
              </div>
            </div>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>

    </RowComponent>

  </ContainerComponent>

  <!-- Dialog de Associação de Tarefas -->
  <DialogComponent v-if="dialogAssociacao" v-model="dialogAssociacao" max-width="1400px" scrollable @keydown.esc="fecharDialogAssociacao">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">mdi-link-variant</IconComponent>
        <span class="text-h6">Associar mobilidades: {{ tarefa?.tarefa }}</span>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="fecharDialogAssociacao" />
      </CardTitleComponent>

      <CardTextComponent class="pt-4">
        <RowComponent>
          <ColComponent
            v-for="grupo in gruposAssociacao"
            :key="grupo.grupo"
            cols="12" sm="6" md="4"
          >
            <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-0" v-if="grupo.processo_pai">
              Ordem: {{ grupo.ordenacao_pai }}. {{ grupo.processo_pai }}
            </div>
            <div class="text-subtitle-2 font-weight-bold text-primary mb-1">Ordem: {{ grupo.ordenacao_pai }}.{{ grupo.ordenacao }}. {{ grupo.grupo }}</div>
            <DividerComponent class="mb-3" />
            <CheckboxItemComponent
              v-for="opt in grupo.options"
              :key="opt.value"
              v-model="mobilidadesSelecionadas"
              :value="opt.value"
              :label="`${opt.ordenacao}. ${opt.text}`"
              :disabled="opt.value === tarefaId"
              hide-details
              density="compact"
              color="primary"
              class="my-1"
            />
          </ColComponent>

          <ColComponent v-if="gruposAssociacao.length === 0" cols="12">
            <p class="text-body-2 text-medium-emphasis text-center py-6">
              Carregando tarefas…
            </p>
          </ColComponent>
        </RowComponent>
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <SpacerComponent />
        <ButtonComponent variant="text" @click="fecharDialogAssociacao">Cancelar</ButtonComponent>
        <ButtonComponent color="primary" variant="flat" :loading="salvandoAssociacao" @click="salvarAssociacao">
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'

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
import CheckboxItemComponent from '@/components/comuns/forms/CheckboxItemComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'

const route  = useRoute()
const router = useRouter()

const tarefaId = computed(() => Number(route.params.id))

const carregando = ref(true)

const tarefa           = ref(null)
const gruposDestinos   = ref([])
const gruposOrigens    = ref([])
const tiposMobilidade  = ref([])
const todasTarefas     = ref([])
const atualizandoTipo  = ref(null)

const snackbar = ref({ show: false, message: '', color: 'success' })

// --- Funil de navegação ---
const funilMacro    = ref(null)
const funilProcesso = ref(null)
const funilTarefa   = ref(null)

const opsMacro = computed(() => {
  const map = {}
  todasTarefas.value.forEach(t => {
    const pai = t.processo?.processo_pai
    if (pai && !map[pai.id]) {
      map[pai.id] = { id: pai.id, nome: `${pai.ordenacao}. ${pai.processo}`, ordenacao: pai.ordenacao ?? 0 }
    }
  })
  return Object.values(map).sort((a, b) => a.ordenacao - b.ordenacao)
})

const opsProcesso = computed(() => {
  const map = {}
  todasTarefas.value
    .filter(t => !funilMacro.value || t.processo?.ctrl_processo_id === funilMacro.value)
    .forEach(t => {
      const p = t.processo
      if (p && !map[p.id]) {
        map[p.id] = { id: p.id, nome: `${p.ordenacao}. ${p.processo}`, ordenacao: p.ordenacao ?? 0 }
      }
    })
  return Object.values(map).sort((a, b) => a.ordenacao - b.ordenacao)
})

const opsTarefa = computed(() => {
  return todasTarefas.value
    .filter(t => {
      if (funilProcesso.value) return t.ctrl_processo_id === funilProcesso.value
      if (funilMacro.value)    return t.processo?.ctrl_processo_id === funilMacro.value
      return true
    })
    .sort((a, b) => {
      const dPai  = (a.processo?.processo_pai?.ordenacao ?? 0) - (b.processo?.processo_pai?.ordenacao ?? 0)
      const dProc = (a.processo?.ordenacao ?? 0) - (b.processo?.ordenacao ?? 0)
      const dTar  = (a.ordenacao ?? 0) - (b.ordenacao ?? 0)
      return dPai || dProc || dTar
    })
    .map(t => ({
      id:   t.id,
      nome: funilProcesso.value
        ? `${t.ordenacao}. ${t.tarefa}`
        : `${t.processo?.processo} › ${t.ordenacao}. ${t.tarefa}`,
    }))
})

watch(funilMacro, () => {
  funilProcesso.value = null
  funilTarefa.value   = null
})

watch(funilProcesso, () => {
  funilTarefa.value = null
})

watch(funilTarefa, (id) => {
  if (id && id !== tarefaId.value) {
    router.push({ name: route.name, params: { id } })
  }
})

watch(tarefaId, () => {
  funilTarefa.value = null
  carregar()
})

function agruparPorProcesso(tarefas) {
  const agrupado = {}
  tarefas.forEach(t => {
    const nomeGrupo = t.processo?.processo ?? 'Sem processo'
    if (!agrupado[nomeGrupo]) {
      agrupado[nomeGrupo] = {
        grupo:        nomeGrupo,
        processo_pai: t.processo?.processo_pai?.processo ?? null,
        ordenacao_pai: t.processo?.processo_pai?.ordenacao ?? 0,
        ordenacao:    t.processo?.ordenacao ?? 0,
        options:      [],
      }
    }
    agrupado[nomeGrupo].options.push({ value: t.id, text: t.tarefa, ordenacao: t.ordenacao ?? 0 })
  })
  return Object.values(agrupado)
    .sort((a, b) => a.ordenacao_pai - b.ordenacao_pai || a.ordenacao - b.ordenacao)
    .map(g => ({ ...g, options: g.options.sort((a, b) => a.ordenacao - b.ordenacao) }))
}

function agruparDestinosPorProcesso(destinos) {
  const agrupado = {}
  destinos.forEach(t => {
    const nomeGrupo = t.processo?.processo ?? 'Sem processo'
    if (!agrupado[nomeGrupo]) {
      agrupado[nomeGrupo] = {
        grupo:        nomeGrupo,
        processo_pai: t.processo?.processo_pai?.processo ?? null,
        ordenacao_pai: t.processo?.processo_pai?.ordenacao ?? 0,
        ordenacao:    t.processo?.ordenacao ?? 0,
        options:      [],
      }
    }
    agrupado[nomeGrupo].options.push({
      value:          t.id,
      text:           t.tarefa,
      ordenacao:      t.ordenacao ?? 0,
      mobilidade_id:  t.pivot?.id ?? null,
      tipo_id:        t.pivot?.ctrl_mobilidade_tipo_id ?? null,
      is_interrupcao: t.tipo_tarefa?.tipo === 'Interrupção',
    })
  })
  return Object.values(agrupado)
    .sort((a, b) => a.ordenacao_pai - b.ordenacao_pai || a.ordenacao - b.ordenacao)
    .map(g => ({ ...g, options: g.options.sort((a, b) => a.ordenacao - b.ordenacao) }))
}

function corTipo(tipoNome) {
  if (tipoNome === 'Avanço')    return 'success'
  if (tipoNome === 'Devolução') return 'error'
  return 'primary'
}

async function atualizarTipo(mobilidadeId, tipoId) {
  if (!mobilidadeId) return
  atualizandoTipo.value = mobilidadeId
  try {
    await api.put(`wf/mobilidades/${mobilidadeId}`, { ctrl_mobilidade_tipo_id: tipoId })
    snackbar.value = { show: true, message: 'Tipo de mobilidade atualizado!', color: 'success' }
    await carregar()
  } finally {
    atualizandoTipo.value = null
  }
}

async function carregar() {
  carregando.value = true
  try {
    const [resTarefa, resMobilidades, resTipos] = await Promise.all([
      api.get(`wf/tarefas/${tarefaId.value}`),
      api.get(`wf/tarefas-mobilidades/${tarefaId.value}`),
      tiposMobilidade.value.length ? Promise.resolve(null) : api.get('wf/mobilidades-tipos'),
    ])

    tarefa.value = resTarefa.data?.data ?? null

    if (resTipos) {
      tiposMobilidade.value = resTipos.data?.data ?? []
    }

    const mobilidade = resMobilidades.data?.data ?? {}

    if (!todasTarefas.value.length) {
      todasTarefas.value = mobilidade.tarefas ?? []
    }

    gruposDestinos.value = agruparDestinosPorProcesso(mobilidade.destinos ?? [])
    gruposOrigens.value  = agruparPorProcesso(mobilidade.origens  ?? [])

  } finally {
    carregando.value = false
  }
}

// --- Associação de tarefas ---
const dialogAssociacao      = ref(false)
const salvandoAssociacao    = ref(false)
const gruposAssociacao      = ref([])
const mobilidadesSelecionadas = ref([])

const abrirDialogAssociacao = async () => {
  gruposAssociacao.value = []
  mobilidadesSelecionadas.value = []
  dialogAssociacao.value = true

  const resAssociadas = await api.get(`wf/tarefas-mobilidades/${tarefaId.value}`);

  const mobilidade = resAssociadas.data?.data ?? {}
  const destinos = mobilidade.destinos ?? []
  mobilidadesSelecionadas.value = destinos.map(t => t.id)

  const todasTarefas = mobilidade.tarefas ?? []

  const agrupado = {}
  todasTarefas.forEach(t => {
    const nomeGrupo = t.processo?.processo ?? 'Sem processo'
    if (!agrupado[nomeGrupo]) {
      agrupado[nomeGrupo] = {
        grupo:         nomeGrupo,
        processo_pai:  t.processo?.processo_pai?.processo ?? null,
        ordenacao_pai: t.processo?.processo_pai?.ordenacao ?? 0,
        ordenacao:     t.processo?.ordenacao ?? 0,
        options:       [],
      }
    }
    agrupado[nomeGrupo].options.push({ value: t.id, text: t.tarefa, ordenacao: t.ordenacao ?? 0 })
  })
  gruposAssociacao.value = Object.values(agrupado)
    .sort((a, b) => a.ordenacao_pai - b.ordenacao_pai || a.ordenacao - b.ordenacao)
    .map(g => ({ ...g, options: g.options.sort((a, b) => a.ordenacao - b.ordenacao) }))
}

const salvarAssociacao = async () => {
  salvandoAssociacao.value = true
  try {
    await api.post('wf/tarefas-mobilidades', {
      ctrl_origem_tarefa_id: tarefaId.value,
      mobilidades: mobilidadesSelecionadas.value,
    })
    snackbar.value = { show: true, message: 'Associações salvas com sucesso!', color: 'success' }
    fecharDialogAssociacao()
    await carregar()
  } finally {
    salvandoAssociacao.value = false
  }
}

const fecharDialogAssociacao = () => {
  dialogAssociacao.value = false
  setTimeout(() => {
    gruposAssociacao.value = []
    mobilidadesSelecionadas.value = []
  }, 300)
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

.grupo-titulo-pai {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.45;
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
