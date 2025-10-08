<template>
  <CrudComponent
      route="app/users"
      title="Usuários"
      :fields="userFields"
      :headers="userHeaders"
  >
    <template #actions="{ isEditing, form, closeModal }">
      <ButtonComponent v-if="isEditing" color="warning" text @click="resetPassword(form, closeModal)">
        Resetar Senha
      </ButtonComponent>
    </template>
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";

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

const resetPassword = (form, closeModal) => {
  if (confirm('Tem certeza que deseja resetar a senha para este usuário?')) {
    console.log('Resetando senha para:', form.id)
    // Aqui, chame a API real, ex.: await userService.resetPassword(form.id)
    // Se sucesso, exiba um snackbar personalizado ou use emit para notificar
    closeModal() // Fecha o modal após sucesso, se desejado
  }
}
</script>