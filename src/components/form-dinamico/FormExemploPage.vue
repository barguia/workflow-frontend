<template>
  <ContainerComponent>
    <CardComponent max-width="1000" class="mx-auto">
      <CardTitleComponent class="text-h5">Formulário Dinâmico Completo</CardTitleComponent>
      <CardTextComponent>
        <FormularioDinamico
            :fields="fields"
            v-model="form"
            :validation-errors="{}"
            ref="formulario"
            @field-change="onChange"
        />
      </CardTextComponent>
      <CardActionsComponent>
        <v-spacer />
        <ButtonComponent color="error" @click="resetar">Resetar</ButtonComponent>
        <ButtonComponent color="primary" @click="salvar">Salvar</ButtonComponent>
      </CardActionsComponent>
    </CardComponent>

    <CardComponent class="mt-6">
      <CardTitleComponent>Dados do Formulário (debug)</CardTitleComponent>
      <CardTextComponent>
        <pre>{{ form }}</pre>
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/apiMock.js'
import FormularioDinamico from "@/components/form-dinamico/FormularioDinamico.vue";
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'

// === USUÁRIO SIMULADO (para renderIf) ===
const user = { isAdmin: true }

// === FORMULÁRIO ===
const form = ref({
  nome: '',
  email: '',
  estado_id: null,
  cidade_id: null,
  interesses: [],
  observacoes: '',
  campo_admin: ''
})

const formulario = ref(null)

// === CAMPOS COM TODAS AS FUNCIONALIDADES ===
const fields = computed(() => [
  {
    key: 'nome',
    label: 'Nome Completo',
    type: 'text',
    rules: [v => !!v || 'Nome é obrigatório'],
    col: 6,
  },
  {
    key: 'email',
    label: 'E-mail',
    type: 'email',
    rules: [
      v => !!v || 'E-mail é obrigatório',
      v => /.+@.+\..+/.test(v) || 'E-mail inválido'
    ],
    col: 6,
  },
  {
    key: 'estado_id',
    label: 'Estado',
    type: 'select',
    options: () => api.get('/estados'),
    rules: [v => !!v || 'Selecione um estado'],
    onChange: async ({ setField }) => {
      setField('cidade_id', null) // limpa cidade
    },
    col: 6,
  },
  {
    key: 'cidade_id',
    label: 'Cidade',
    type: 'select',
    dependsOn: 'estado_id',
    disabled: form => !form.estado_id,
    options: async (form) => {
      if (!form.estado_id) return []
      return await api.get(`/cidades?estado_id=${form.estado_id}`)
    },
    rules: [v => !!v || 'Selecione uma cidade'],
    col: 6,
  },
  {
    key: 'interesses',
    label: 'Interesses',
    type: 'select',
    multiple: true,
    options: () => api.get('/interesses'),
    rules: [v => (v && v.length > 0) || 'Selecione pelo menos um interesse'],
    col: 6,
  },
  {
    key: 'observacoes',
    label: 'Observações (aparece só em SP)',
    type: 'textarea',
    visible: form => form.estado_id === 1, // só aparece se for SP
    optional: true,
  },
  {
    key: 'campo_admin',
    label: 'Campo Secreto (Admin Only)',
    type: 'text',
    renderIf: () => user.isAdmin, // v-if: só existe se for admin
    disabled: true,
    rules: [],
  }
])

// === EVENTOS ===
const onChange = ({ field, value }) => {
  const isSelect = field.type === 'select'
  console.log(
      `%c[CHANGE] Campo ${field.key} mudou: %c${JSON.stringify(value)}`,
      `font-weight: bold;`,
      `color: ${isSelect ? '#0f0' : '#00f'};`
  )
}

const salvar = () => {
  console.log('Salvando:', form.value)
  alert('Dados salvos! Veja o console.')
}

const resetar = () => {
  form.value = {
    nome: '',
    email: '',
    estado_id: null,
    cidade_id: null,
    interesses: [],
    observacoes: '',
    campo_admin: ''
  }
  formulario.value?.resetValidation()
}
</script>

<style scoped>
pre {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 1rem;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>
