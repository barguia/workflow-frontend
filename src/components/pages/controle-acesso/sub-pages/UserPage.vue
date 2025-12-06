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
import {authService} from "@/services/authService.js"

const userFields = [
  { key: 'name', label: 'Nome', type: 'text', rules: [v => !!v || 'Nome é obrigatório'], optional: false },
  { key: 'email', label: 'Email', type: 'email', rules: [v => !!v || 'Email é obrigatório', v => /.+@.+\..+/.test(v) || 'Email deve ser válido'], optional: false },
  // { key: 'phone', label: 'Telefone', rules: [v => !v || /^\d{10,11}$/.test(v) || 'Telefone deve ser válido (10-11 dígitos)'], optional: true },
  // { key: 'birthDate', label: 'Data de Nascimento', type: 'date', rules: [v => !!v || 'Data de Nascimento é obrigatória'], optional: false }
]

const userHeaders = [
  { title: 'Nome', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: '', value: 'actions'}
]

async function resetPassword (form, closeModal) {
  if (confirm('Tem certeza que deseja resetar a senha para este usuário?')) {
    console.log('Resetando senha para:', form.id)
    const data =  await authService.forgotPassword({email: form.email})
    window.dispatchEvent(
        new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: data.message,
          },
        }));
    closeModal()
  }
}
</script>