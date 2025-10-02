<template>
  <CrudComponent
      route="users"
      title="Usuários"
      :fields="userFields"
      :headers="userHeaders"
      has-reset-password
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

const userFields = [
  { key: 'name', label: 'Nome', type: 'text', rules: [v => !!v || 'Nome é obrigatório'], optional: false },
  { key: 'email', label: 'Email', type: 'email', rules: [v => !!v || 'Email é obrigatório', v => /.+@.+\..+/.test(v) || 'Email deve ser válido'], optional: false },
  { key: 'phone', label: 'Telefone', rules: [v => !v || /^\d{10,11}$/.test(v) || 'Telefone deve ser válido (10-11 dígitos)'], optional: true },
  { key: 'birthDate', label: 'Data de Nascimento', type: 'date', rules: [v => !!v || 'Data de Nascimento é obrigatória'], optional: false }
]

const userHeaders = [
  { text: 'Nome', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'Telefone', value: 'phone' },
  { text: 'Data de Nascimento', value: 'birthDate' },
  { text: 'Ações', value: 'actions', sortable: false }
]
</script>