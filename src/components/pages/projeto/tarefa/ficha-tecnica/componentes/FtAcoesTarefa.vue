<template>
  <!-- Barra de ações -->
  <CardComponent rounded="xl" variant="elevated" class="mb-6">
    <CardTextComponent class="pa-4 d-flex align-center gap-3 flex-wrap">
      <div class="section-label">Ações</div>
      <SpacerComponent />

      <ProgressCircularComponent v-if="carregandoAcoes" indeterminate size="22" width="2" color="primary" />

      <template v-else>
        <ButtonComponent
          v-if="acoes.adotar"
          color="primary"
          variant="tonal"
          size="small"
          :loading="executando === 'adotar'"
          @click="executarAcao('adotar')"
        >
          <IconComponent start>mdi-account-arrow-right-outline</IconComponent>
          Adotar
        </ButtonComponent>

        <ButtonComponent
          v-if="acoes.iniciar_tratamento"
          color="success"
          variant="tonal"
          size="small"
          :loading="executando === 'iniciar_tratamento'"
          @click="executarAcao('iniciar_tratamento')"
        >
          <IconComponent start>mdi-play-circle-outline</IconComponent>
          Iniciar Tratamento
        </ButtonComponent>

        <ButtonComponent
          v-if="acoes.cancelar_tratamento"
          color="warning"
          variant="tonal"
          size="small"
          :loading="executando === 'cancelar_tratamento'"
          @click="confirmar('cancelar_tratamento')"
        >
          <IconComponent start>mdi-cancel</IconComponent>
          Cancelar Tratamento
        </ButtonComponent>

        <ButtonComponent
          v-if="acoes.abandonar"
          color="error"
          variant="tonal"
          size="small"
          :loading="executando === 'abandonar'"
          @click="confirmar('abandonar')"
        >
          <IconComponent start>mdi-account-remove-outline</IconComponent>
          Abandonar
        </ButtonComponent>

        <ButtonComponent
          v-if="acoes.devolver_para_fila"
          color="secondary"
          variant="tonal"
          size="small"
          :loading="executando === 'devolver_para_fila'"
          @click="executarAcao('devolver_para_fila')"
        >
          <IconComponent start>mdi-arrow-u-left-top</IconComponent>
          Devolver para Fila
        </ButtonComponent>

        <ButtonComponent
          v-if="acoes.realizar_tratamento"
          color="primary"
          variant="tonal"
          size="small"
          :disabled="!!tarefa.finalized_at"
          @click="abrirDialog"
        >
          <IconComponent start>mdi-clipboard-edit-outline</IconComponent>
          Registrar Tratamento
        </ButtonComponent>
      </template>
    </CardTextComponent>
  </CardComponent>

  <!-- Dialog: Confirmar ação destrutiva -->
  <DialogComponent v-if="dialogConfirmar" v-model="dialogConfirmar" max-width="400px">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent :color="acaoConfig[acaoSelecionada]?.color" size="22">
          {{ acaoConfig[acaoSelecionada]?.icon }}
        </IconComponent>
        <span class="text-h6">{{ acaoConfig[acaoSelecionada]?.titulo }}</span>
      </CardTitleComponent>
      <CardTextComponent class="pt-5 pb-2 px-6">
        {{ acaoConfig[acaoSelecionada]?.mensagem }}
      </CardTextComponent>
      <CardActionsComponent class="px-6 py-4 border-t">
        <SpacerComponent />
        <ButtonComponent variant="text" @click="dialogConfirmar = false">Cancelar</ButtonComponent>
        <ButtonComponent
          :color="acaoConfig[acaoSelecionada]?.color"
          variant="flat"
          :loading="executando === acaoSelecionada"
          @click="executarAcao(acaoSelecionada)"
        >
          Confirmar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>

  <!-- Dialog: Registrar Tratamento -->
  <DialogComponent
    v-if="dialog"
    v-model="dialog"
    max-width="560px"
    @keydown.esc="fecharDialog"
  >
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">mdi-clipboard-edit-outline</IconComponent>
        <span class="text-h6">Registrar Tratamento</span>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="fecharDialog" />
      </CardTitleComponent>

      <CardTextComponent class="pt-5 pb-2 px-6">
        <div class="text-caption text-medium-emphasis mb-4">
          {{ tarefa.tarefa }} · {{ tarefa.processo }}
        </div>

        <SelectComponent
          v-model="form.tratamento_id"
          label="Tratamento"
          :items="opcoesTratamento"
          :loading="carregandoTratamentos"
          :rules="[v => !!v || 'Tratamento é obrigatório']"
          clearable
          class="mb-4"
          @update:model-value="form.ctrl_tarefa_destino_id = null"
        />

        <SelectComponent
          v-if="tarefasDoTratamento.length > 0"
          v-model="form.ctrl_tarefa_destino_id"
          label="Tarefa Destino"
          :items="tarefasDoTratamento"
          :rules="[v => !!v || 'Tarefa destino é obrigatória']"
          clearable
          class="mb-4"
        />

        <TextAreaComponent
          v-model="form.comentario"
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
        <ButtonComponent variant="text" @click="fecharDialog">Cancelar</ButtonComponent>
        <ButtonComponent
          color="primary"
          variant="flat"
          :loading="salvando"
          :disabled="!form.tratamento_id || (tarefasDoTratamento.length > 0 && !form.ctrl_tarefa_destino_id)"
          @click="salvar"
        >
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import api from '@/services/api.js'
import { useCrud } from '@/services/useCrud.js'

import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import DialogComponent from '@/components/comuns/dialogs/DialogComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import TextAreaComponent from '@/components/comuns/forms/TextAreaComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'

const props = defineProps({
  tarefa: { type: Object, required: true },
})

const emit = defineEmits(['tratamento-salvo', 'tratamento-erro', 'acao-executada'])

const { index: fetchStatus } = useCrud('wf/status')

// --- Ações dinâmicas ---
const carregandoAcoes = ref(false)
const executando      = ref(null)
const acoes           = ref({
  adotar: false,
  iniciar_tratamento: false,
  cancelar_tratamento: false,
  abandonar: false,
  devolver_para_fila: false,
  realizar_tratamento: false,
})

const dialogConfirmar = ref(false)
const acaoSelecionada = ref(null)

const ENDPOINTS = {
  adotar:             id => `wf/tratamento/adotar/${id}`,
  iniciar_tratamento: id => `wf/tratamento/iniciar/${id}`,
  cancelar_tratamento: id => `wf/tratamento/cancelar/${id}`,
  abandonar:          id => `wf/tratamento/abandonar/${id}`,
  devolver_para_fila: id => `wf/tratamento/devolver-tarefa/${id}`,
}

const acaoConfig = {
  cancelar_tratamento: {
    titulo: 'Cancelar Tratamento',
    mensagem: 'Deseja cancelar o tratamento em andamento?',
    icon: 'mdi-cancel',
    color: 'warning',
  },
  abandonar: {
    titulo: 'Abandonar Tarefa',
    mensagem: 'Deseja abandonar esta tarefa? Ela poderá ser adotada por outro responsável.',
    icon: 'mdi-account-remove-outline',
    color: 'error',
  },
}

async function carregarAcoes() {
  carregandoAcoes.value = true
  try {
    const res = await api.get(`wf/tratamento/acoes/${props.tarefa.pco_tarefa_id}`)
    acoes.value = res.data?.data ?? acoes.value
  } finally {
    carregandoAcoes.value = false
  }
}

function confirmar(acao) {
  acaoSelecionada.value = acao
  dialogConfirmar.value = true
}

async function executarAcao(acao) {
  executando.value = acao
  dialogConfirmar.value = false
  try {
    await api.get(ENDPOINTS[acao](props.tarefa.pco_tarefa_id))
    emit('acao-executada', acao)
    await carregarAcoes()
  } catch {
    // erro tratado pelo interceptor global
  } finally {
    executando.value = null
  }
}

// --- Registrar Tratamento ---
const dialog               = ref(false)
const salvando             = ref(false)
const carregandoStatus     = ref(false)
const carregandoTratamentos = ref(false)

const todosTratamentos     = ref([])
const tarefasDisponiveisGrupos = ref({})

// Mapeamento: acao_sistemica → chave do grupo em tarefas-disponiveis
const ACAO_TO_GRUPO = {
  AVANÇAR:    'Avanço',
  RETROCEDER: 'Devolução',
  INTERROMPER: 'Interromper',
}

// Só exibe tratamentos que têm tarefas configuradas
const opcoesTratamento = computed(() =>
  todosTratamentos.value
    .filter(t => {
      const grupo = ACAO_TO_GRUPO[t.acao_sistemica]
      return grupo && (tarefasDisponiveisGrupos.value[grupo]?.length ?? 0) > 0
    })
    .map(t => ({ value: t.id, text: t.tratamento }))
)

// Tarefas do tratamento selecionado
const tarefasDoTratamento = computed(() => {
  const tratamento = todosTratamentos.value.find(t => t.id === form.value.tratamento_id)
  if (!tratamento) return []
  const grupo = ACAO_TO_GRUPO[tratamento.acao_sistemica]
  const tarefas = grupo ? (tarefasDisponiveisGrupos.value[grupo] ?? []) : []
  return tarefas.map(t => {
    return { value: t.id, text: t.tarefa }
  })
})

const form = ref({ tratamento_id: null, ctrl_tarefa_destino_id: null, ctrl_status_id: null, comentario: '' })

async function abrirDialog() {
  form.value = { tratamento_id: null, ctrl_tarefa_destino_id: null, ctrl_status_id: null, comentario: '' }
  dialog.value = true

  const promises = []

  carregandoTratamentos.value = true
  promises.push(
    Promise.all([
      api.get('wf/get-tratamentos'),
      api.get(`wf/tratamento/tarefas-disponiveis/${props.tarefa.pco_tarefa_id}`),
    ])
      .then(([resTratamentos, resTarefas]) => {
        todosTratamentos.value = resTratamentos.data?.data ?? []
        tarefasDisponiveisGrupos.value = resTarefas.data?.data ?? {}
      })
      .finally(() => { carregandoTratamentos.value = false })
  )

  await Promise.all(promises)
}

function fecharDialog() {
  dialog.value = false
  setTimeout(() => {
    form.value = { tratamento_id: null, ctrl_tarefa_destino_id: null, ctrl_status_id: null, comentario: '' }
  }, 300)
}

async function salvar() {
  salvando.value = true
  try {
    await api.post('wf/tratamento/concluir', {
      pco_tarefa_id:      props.tarefa.pco_tarefa_id,
      ctrl_tratamento_id: form.value.tratamento_id,
      ctrl_tarefa_id:     form.value.ctrl_tarefa_destino_id || null,
      descricao: form.value.comentario || null
    })
    fecharDialog()
    emit('tratamento-salvo')
  } catch {
    emit('tratamento-erro')
  } finally {
    salvando.value = false
  }
}

onMounted(carregarAcoes)
</script>

<style scoped>
.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.55;
}
</style>
