<template>
  <!-- 404 -->
  <ContainerComponent v-if="naoEncontrado" class="fill-height d-flex align-center justify-center text-center" fluid>
    <div>
      <IconComponent size="72" color="error">mdi-file-alert-outline</IconComponent>
      <div class="text-h5 font-weight-bold mt-4">Registro não encontrado</div>
      <p class="text-body-1 mt-2 text-medium-emphasis">
        A tarefa com ID <strong>#{{ route.params.id }}</strong> não existe ou foi removida.
      </p>
      <ButtonComponent class="mt-6" color="primary" @click="router.back()" data-testid="ficha-tarefa-btn-voltar-404">
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
    <FtCabecalho :tarefa="tarefa" @voltar="router.back()">
      <template #acoes>
        <FtAcoesTarefa
          :tarefa="tarefa"
          @tratamento-salvo="onTratamentoSalvo"
          @tratamento-erro="onTratamentoErro"
          @acao-executada="onAcaoExecutada"
        />
      </template>
    </FtCabecalho>

    <!-- Body 1: Dados complementares do projeto + Body 2: Detalhes da tarefa -->
    <RowComponent dense class="mb-6">
      <ColComponent cols="12" md="6">
        <FtDadosProjeto :tarefa="tarefa" />
      </ColComponent>
      <ColComponent cols="12" md="6">
        <FtDetalhesTarefa :tarefa="tarefa" />
      </ColComponent>
    </RowComponent>

    <!-- Segmento de Histórico -->
    <FtHistoricoTarefa
      :tratamentos="tratamentos"
      :carregando="carregandoTratamentos"
      @atualizar="carregarTratamentos"
    />

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'

import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import SnackbarComponent from '@/components/comuns/alerts/SnackbarComponent.vue'

import FtCabecalho      from './componentes/FtCabecalho.vue'
import FtDadosProjeto   from './componentes/FtDadosProjeto.vue'
import FtDetalhesTarefa from './componentes/FtDetalhesTarefa.vue'
import FtAcoesTarefa    from './componentes/FtAcoesTarefa.vue'
import FtHistoricoTarefa from './componentes/FtHistoricoTarefa.vue'

const route  = useRoute()
const router = useRouter()

const tarefa        = ref(null)
const carregando    = ref(true)
const naoEncontrado = ref(false)

const tratamentos          = ref([])
const carregandoTratamentos = ref(false)

const snackbar = ref({ show: false, message: '', color: 'success' })

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
    const res = await api.get(`wf/tratamento/get-log-tratamentos/${tarefa.value.pco_workflow_id}`)
    tratamentos.value = res.data?.data ?? []
  } catch {
    tratamentos.value = []
  } finally {
    carregandoTratamentos.value = false
  }
}

function onTratamentoSalvo() {
  snackbar.value = { show: true, message: 'Tratamento registrado com sucesso!', color: 'success' }
  Promise.all([carregarFicha(), carregarTratamentos()])
}

function onTratamentoErro() {
  snackbar.value = { show: true, message: 'Erro ao registrar tratamento.', color: 'error' }
}

function onAcaoExecutada() {
  Promise.all([carregarFicha(), carregarTratamentos()])
}

onMounted(async () => {
  await carregarFicha()
  if (!naoEncontrado.value) await carregarTratamentos()
})
</script>
