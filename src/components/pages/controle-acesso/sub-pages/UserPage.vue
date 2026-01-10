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

    <template #actionsField="{ item }">
      <v-icon small @click="openModalRole(item)" class="ml-2">
        mdi-account-key
      </v-icon>
    </template>
  </CrudComponent>

  <UmParaMuitosComponent2
      v-model="dialog"
      v-if="dialog"
      :titulo="`Perfis do usuário: ${userSelecionado.name}`"
      :entidadeId="userSelecionado.id"
      campoAgrupamento="Perfis"
      campoIdsAssociados="roles_ids"
      :selecionados="user_roles"
      :todos-itens="grupo_roles"
  @salvo="fecharModalRole"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import {authService} from "@/services/authService.js"
import UmParaMuitosComponent2 from "@/components/comuns/associacao/UmParaMuitosComponent2.vue";
import {ref} from "vue";
import api from "@/services/api.js";


const dialog = ref(false)
let userSelecionado = ref(null)
const grupo_roles = ref(null)
const user_roles = ref([])

const userFields = [
  { key: 'name', label: 'Nome', type: 'text', rules: [v => !!v || 'Nome é obrigatório'], optional: false },
  { key: 'email', label: 'Email', type: 'email', rules: [v => !!v || 'Email é obrigatório', v => /.+@.+\..+/.test(v) || 'Email deve ser válido'], optional: false },
]

const userHeaders = [
  { title: 'Nome', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: '', value: 'actions'}
]

const openModalRole = async (parametro) => {

  const response = await api.get(`app/roles`)
  grupo_roles.value = []
  response.data.data.forEach((item) => {
    const grupoNome = item.guard_name
    let grupoExistente = grupo_roles.value.find(g => g.grupo === grupoNome)

    if (!grupoExistente) {
      grupoExistente = { grupo: grupoNome, options: [] }
      grupo_roles.value.push(grupoExistente)
    }

    grupoExistente.options.push({
      value: item.id,
      text: item.name
    })
  })

  // Ordena os grupos
  grupo_roles.value.sort((a, b) => a.grupo.localeCompare(b.grupo))


  const response2 = await api.get(`app/roles-user/${parametro.id}`)
  user_roles.value = []
  response2.data.data.forEach((item) => {
    user_roles.value.push(item.id)
  })

  userSelecionado.value = parametro
  dialog.value = true
}

const fecharModalRole = async (parametro) => {
  userSelecionado.value = null
  dialog.value = false
}

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