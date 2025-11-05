<template>
  <v-container>
    <v-card max-width="1000" class="mx-auto">
      <v-card-title class="text-h5">Formulário Dinâmico Completo</v-card-title>
      <v-card-text>
        <FormularioDinamico
            :fields="fields"
            v-model="form"
            :validation-errors="{}"
            ref="formulario"
            @field-change="onChange"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" @click="resetar">Resetar</v-btn>
        <v-btn color="primary" @click="salvar">Salvar</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mt-6">
      <v-card-title>Dados do Formulário (debug)</v-card-title>
      <v-card-text>
        <pre>{{ form }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/apiMock.js'
import FormularioDinamico from "@/components/form-dinamico/FormularioDinamico.vue";

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
  console.log(`Campo ${field.key} mudou:`, value)
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
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>