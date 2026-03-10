<!-- UmParaMuitosComponent.vue -->
<template>
  <v-dialog v-model="aberto" :max-width="larguraMaxima" persistent @keydown.esc="fechar">
    <CardComponent>
      <CardTitleComponent>
        <span class="text-h5">{{ titulo }}</span>
      </CardTitleComponent>

      <CardTextComponent>
        <FormComponent>
          <RowComponent>
            <!-- Com agrupamento -->
            <ColComponent
                v-for="grupo in itensAgrupados"
                :key="grupo.nome"
                cols="12"
                xs="12"
                sm="6"
                md="4"
                lg="3"
                xl="3"
            >
              <v-divider class="mb-3" />
              <div class="text-h6 text-center mb-2">{{ grupo.grupo }}</div>

              <v-checkbox
                  v-for="opcao in grupo.opcoes"
                  :key="opcao.value"
                  v-model="itensSelecionados"
                  :value="opcao.value"
                  hide-details
                  density="compact"
                  class="ma-0 my-1"
                  style="height: 34px;"
              >
                <template #label>
                  <v-chip
                      :color="itensSelecionados.includes(opcao.value) ? 'primary' : 'grey-lighten-2'"
                      size="small"
                      class="px-2 text-caption font-weight-medium"
                  >
                    {{ opcao.text }}
                  </v-chip>
                </template>
              </v-checkbox>
            </ColComponent>

            <!-- Sem agrupamento (fallback) -->
            <ColComponent v-if="itensAgrupados.length === 0 && todosItens.length > 0" cols="12">
              <v-checkbox
                  v-for="opcao in todosItens"
                  :key="opcao.value"
                  v-model="itensSelecionados"
                  :value="opcao.value"
                  hide-details
                  density="compact"
                  class="ma-0 my-1"
              >
                <template #label>
                  <v-chip
                      :color="itensSelecionados.includes(opcao.value) ? 'primary' : 'grey-lighten-2'"
                      size="small"
                      class="px-2"
                  >
                    {{ opcao.text }}
                  </v-chip>
                </template>
              </v-checkbox>
            </ColComponent>
          </RowComponent>
        </FormComponent>
      </CardTextComponent>

      <CardActionsComponent>
        <v-spacer />
        <ButtonComponent color="blue darken-1" text @click="fechar">
          Cancelar
        </ButtonComponent>
        <ButtonComponent
            color="primary"
            text
            :loading="salvando"
            :disabled="!houveMudanca"
            @click="salvar"
        >
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api.js'

import CardComponent from "@/components/comuns/cards/CardComponent.vue"
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue"
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue"
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue"
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue"
import FormComponent from "@/components/comuns/forms/FormComponent.vue"
import RowComponent from "@/components/comuns/layout/RowComponent.vue"
import ColComponent from "@/components/comuns/layout/ColComponent.vue"

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  titulo: { type: String, required: true },
  entidadeId: { type: [Number, String], required: true },           // ex: ID do perfil
  endpointApi: { type: String, required: true },                    // ex: 'app/roles-permissions'
  campoIdsAssociados: { type: String, default: 'ids_associados' },   // ex: 'permissions_ids'
  campoAgrupamento: { type: String, default: 'grupo' },             // campo no JSON que define o grupo
  formatadorTexto: {                                               // como exibir o nome do item
    type: Function,
    default: (item) => item.nome || item.name || 'Sem nome'
  },
  todosItens: {type: Object, required: true},
  parametrosCarregamento: { type: Object, default: () => ({}) },    // ex: { guard_name: 'api' }
  campoValor: { type: String, default: 'id' },                      // campo que é o ID
  metodoAtualizacao: { type: String, default: 'POST' },             // POST ou PUT
  larguraMaxima: { type: String, default: '1200px' }
})

const emit = defineEmits(['update:modelValue', 'salvo'])

const aberto = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})

const itensSelecionados = ref([])
const todosItens = props.todosItens
const itensAgrupados = ref([])       // lista agrupada
const itensOriginais = ref([])       // para comparar mudanças
const salvando = ref(false)

const houveMudanca = computed(() => {
  const atual = [...itensSelecionados.value].sort((a, b) => a - b)
  const original = [...itensOriginais.value].sort((a, b) => a - b)
  return JSON.stringify(atual) !== JSON.stringify(original)
})


const salvar = async () => {
  salvando.value = true
  try {
    const payload = {
      id: props.entidadeId,
      [props.campoIdsAssociados]: itensSelecionados.value
    }

    await api({
      method: props.metodoAtualizacao,
      url: props.endpointApi,
      data: payload
    })

    itensOriginais.value = [...itensSelecionados.value]
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
  itensSelecionados.value = []
  todosItens.value = []
  itensAgrupados.value = []
}
</script>

<style scoped>
.v-chip {
  min-width: 80px;
  justify-content: center;
}
</style>