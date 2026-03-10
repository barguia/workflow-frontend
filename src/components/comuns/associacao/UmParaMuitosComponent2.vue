<!--
  @component    UmParaMuitosComponent2
  @version      1.0.0
  @readme       src/components/comuns/associacao/README.md

  CONTRATO PÚBLICO — alterar qualquer item abaixo exige bump de @version e
  atualização do README correspondente.

  Props:
    modelValue         Boolean   false       Controla visibilidade do dialog (v-model)
    titulo             String    required    Título exibido no cabeçalho do dialog
    entidadeId         Number|String required ID da entidade principal (ex: id do usuário)
    endpointApi        String    required    Endpoint da API para salvar (ex: 'app/roles-user')
    campoIdsAssociados String   'ids_associados'  Chave do payload com o array de IDs
    selecionados       Array     []          IDs já associados (pré-selecionados)
    todosItens         Array     required    Grupos de itens disponíveis para seleção
                                             Formato: [{ grupo: string, options: [{ value, text }] }]
    metodoAtualizacao  String   'POST'       Método HTTP ('POST' ou 'PUT')
    larguraMaxima      String   '1200px'     Largura máxima do dialog

  Emits:
    update:modelValue  (Boolean) — fecha o dialog via v-model
    salvo              ()        — disparado após save bem-sucedido na API

  Payload enviado à API:
    { id: entidadeId, [campoIdsAssociados]: number[] }
-->
<template>
  <v-dialog v-model="aberto" :max-width="larguraMaxima" persistent scrollable @keydown.esc="fechar">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <v-icon color="primary" size="22">mdi-link-variant</v-icon>
        <span class="text-h6">{{ titulo }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="fechar" />
      </CardTitleComponent>

      <CardTextComponent class="pt-4">
        <RowComponent>
          <ColComponent
            v-for="grupo in itensAgrupados"
            :key="grupo.grupo"
            cols="12" sm="6" md="4" lg="3"
          >
            <div class="text-subtitle-2 font-weight-bold text-primary mb-1">{{ grupo.grupo }}</div>
            <v-divider class="mb-3" />

            <v-checkbox
              v-for="opcao in grupo.options"
              :key="opcao.value"
              v-model="selecionadosLocal"
              :value="opcao.value"
              :label="opcao.text"
              hide-details
              density="compact"
              color="primary"
              class="my-1"
            />
          </ColComponent>

          <ColComponent v-if="itensAgrupados.length === 0" cols="12">
            <p class="text-body-2 text-medium-emphasis text-center py-6">
              Nenhum item disponível.
            </p>
          </ColComponent>
        </RowComponent>
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <v-spacer />
        <ButtonComponent variant="text" @click="fechar">Cancelar</ButtonComponent>
        <ButtonComponent color="primary" variant="flat" :loading="salvando" @click="salvar">
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api.js'

import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'

const props = defineProps({
  modelValue:          { type: Boolean, default: false },
  titulo:              { type: String,  required: true },
  entidadeId:          { type: [Number, String], required: true },
  endpointApi:         { type: String,  required: true },
  campoIdsAssociados:  { type: String,  default: 'ids_associados' },
  selecionados:        { type: Array,   default: () => [] },
  todosItens:          { type: Array,   required: true },
  metodoAtualizacao:   { type: String,  default: 'POST' },
  larguraMaxima:       { type: String,  default: '1200px' },
})

const emit = defineEmits(['update:modelValue', 'salvo'])

const aberto = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
})

const selecionadosLocal = ref([])
const salvando = ref(false)

// Sincroniza a seleção local sempre que o dialog abrir com novos dados
watch(() => props.selecionados, (novos) => {
  selecionadosLocal.value = Array.isArray(novos) ? [...novos] : []
}, { immediate: true })

const itensAgrupados = computed(() => props.todosItens ?? [])

const salvar = async () => {
  salvando.value = true
  try {
    await api({
      method: props.metodoAtualizacao,
      url: props.endpointApi,
      data: {
        id: props.entidadeId,
        [props.campoIdsAssociados]: selecionadosLocal.value,
      },
    })
    emit('salvo')
    fechar()
  } catch (erro) {
    console.error('Erro ao salvar associações:', erro)
  } finally {
    salvando.value = false
  }
}

const fechar = () => {
  aberto.value = false
}
</script>

<style scoped>
.v-chip {
  min-width: 80px;
  justify-content: center;
}
</style>
