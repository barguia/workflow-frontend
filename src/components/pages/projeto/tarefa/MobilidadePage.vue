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

    <!-- Detalhes da tarefa -->
    <CardComponent rounded="xl" variant="elevated" class="mb-4">
      <CardTextComponent class="pa-4">
        <RowComponent dense>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Tarefa</div>
            <div class="field-value">{{ tarefa?.tarefa ?? '—' }}</div>
            <div class="field-value">Ordenação: {{ tarefa?.ordenacao ?? '—' }}</div>
          </ColComponent>
          <ColComponent cols="12" sm="4">
            <div class="field-label">Processo</div>
            <div class="field-value">{{ tarefa?.processo?.processo ?? '—' }}</div>
            <div class="field-value">Ordenação: {{ tarefa?.processo?.ordenacao ?? '—' }}</div>
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
                <div class="grupo-titulo mb-1">{{ grupo.grupo }}</div>
                <DividerComponent class="mb-2" />
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <ChipComponent
                    v-for="opcao in grupo.options"
                    :key="opcao.value"
                    color="success"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    {{ opcao.text }}
                  </ChipComponent>
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
                <div class="grupo-titulo mb-1">{{ grupo.grupo }}</div>
                <DividerComponent class="mb-2" />
                <div class="d-flex flex-column gap-2 mt-2">
                  <div
                    v-for="opcao in grupo.options"
                    :key="opcao.value"
                    class="d-flex align-center gap-2"
                  >
                    <ChipComponent
                      color="primary"
                      size="small"
                      variant="tonal"
                      class="font-weight-medium flex-shrink-0"
                    >
                      {{ opcao.text }}
                    </ChipComponent>
                    <SelectComponent
                      :model-value="opcao.tipo_id"
                      :items="tiposMobilidade"
                      item-title="tipo"
                      item-value="id"
                      placeholder="Tipo"
                      density="compact"
                      variant="outlined"
                      hide-details
                      clearable
                      :loading="atualizandoTipo === opcao.mobilidade_id"
                      style="max-width: 160px; min-width: 130px"
                      @update:model-value="val => atualizarTipo(opcao.mobilidade_id, val)"
                    />
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
  <DialogComponent v-if="dialogAssociacao" v-model="dialogAssociacao" max-width="900px" scrollable @keydown.esc="fecharDialogAssociacao">
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
            <div class="text-subtitle-2 font-weight-bold text-primary mb-1">{{ grupo.grupo }}</div>
            <DividerComponent class="mb-3" />
            <CheckboxItemComponent
              v-for="opt in grupo.options"
              :key="opt.value"
              v-model="mobilidadesSelecionadas"
              :value="opt.value"
              :label="opt.text"
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
import { ref, computed, onMounted } from 'vue'
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
const gruposDestinos   = ref([])   // tarefas para onde esta tarefa pode ir
const gruposOrigens    = ref([])   // tarefas de onde esta tarefa pode vir
const tiposMobilidade  = ref([])
const atualizandoTipo  = ref(null) // mobilidade_id sendo atualizado

const snackbar = ref({ show: false, message: '', color: 'success' })

function agruparPorProcesso(tarefas) {
  const agrupado = {}
  tarefas.forEach(t => {
    const nomeGrupo = t.processo?.processo ?? t.processo ?? 'Sem processo'
    if (!agrupado[nomeGrupo]) agrupado[nomeGrupo] = []
    agrupado[nomeGrupo].push({ value: t.id, text: t.tarefa })
  })
  return Object.entries(agrupado).map(([grupo, options]) => ({ grupo, options }))
}

function agruparDestinosPorProcesso(destinos) {
  const agrupado = {}
  destinos.forEach(t => {
    const nomeGrupo = t.processo?.processo ?? t.processo ?? 'Sem processo'
    if (!agrupado[nomeGrupo]) agrupado[nomeGrupo] = []
    agrupado[nomeGrupo].push({
      value:         t.id,
      text:          t.tarefa,
      mobilidade_id: t.pivot?.id ?? null,
      tipo_id:       t.pivot?.ctrl_mobilidade_tipo_id ?? null,
    })
  })
  return Object.entries(agrupado).map(([grupo, options]) => ({ grupo, options }))
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
    if (!agrupado[nomeGrupo]) agrupado[nomeGrupo] = []
    agrupado[nomeGrupo].push({ value: t.id, text: t.tarefa })
  })
  gruposAssociacao.value = Object.entries(agrupado)
    .map(([grupo, options]) => ({ grupo, options }))
    .sort((a, b) => a.grupo.localeCompare(b.grupo))
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

.grupo-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
}
</style>
