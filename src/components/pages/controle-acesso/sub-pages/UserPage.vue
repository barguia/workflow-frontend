<template>
  <CrudComponent
    route="app/users"
    title="Usuários"
    :fields="userFields"
    :headers="userHeaders"
    data-testid="usuario-crud"
  >
    <template #actions="{ isEditing, form, closeModal }">
      <ButtonComponent v-if="isEditing" color="warning" variant="text" @click="resetPassword(form, closeModal)" data-testid="usuario-btn-resetar-senha">
        Resetar Senha
      </ButtonComponent>
    </template>

    <template #actionsField="{ item }">
      <v-btn icon="mdi-account-key" variant="text" size="small" color="primary" @click="openModalRole(item)" data-testid="usuario-btn-perfis" />
    </template>
  </CrudComponent>

  <UmParaMuitosComponent2
    v-if="dialog"
    v-model="dialog"
    :titulo="`Perfis do usuário: ${userSelecionado?.name}`"
    :entidade-id="userSelecionado?.id"
    endpoint-api="app/roles-user"
    campo-ids-associados="roles_ids"
    :selecionados="user_roles"
    :todos-itens="grupo_roles"
    @salvo="fecharModalRole"
  />
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'
import { authService } from '@/services/authService.js'
import api from '@/services/api.js'

const dialog = ref(false)
const userSelecionado = ref(null)
const grupo_roles = ref([])
const user_roles = ref([])

const userFields = [
  { key: 'name',  label: 'Nome',  type: 'text',  rules: [v => !!v || 'Nome é obrigatório'] },
  { key: 'email', label: 'Email', type: 'email', rules: [v => !!v || 'Email é obrigatório', v => /.+@.+\..+/.test(v) || 'Email inválido'] },
]

const userHeaders = [
  { title: 'Nome',  value: 'name' },
  { title: 'Email', value: 'email' },
  { title: '',      value: 'actions' },
]

const openModalRole = async (usuario) => {
  const [resRoles, resUserRoles] = await Promise.all([
    api.get('app/roles'),
    api.get(`app/roles-user/${usuario.id}`),
  ])

  grupo_roles.value = []
  resRoles.data.data.forEach((item) => {
    const grupoNome = item.guard_name
    let grupo = grupo_roles.value.find(g => g.grupo === grupoNome)
    if (!grupo) {
      grupo = { grupo: grupoNome, options: [] }
      grupo_roles.value.push(grupo)
    }
    grupo.options.push({ value: item.id, text: item.name })
  })
  grupo_roles.value.sort((a, b) => a.grupo.localeCompare(b.grupo))

  user_roles.value = resUserRoles.data.data.map(r => r.id)
  userSelecionado.value = usuario
  dialog.value = true
}

const fecharModalRole = () => {
  dialog.value = false
  // Limpa após o dialog fechar para evitar erro de template com null.name
  setTimeout(() => { userSelecionado.value = null }, 300)
}

async function resetPassword(form, closeModal) {
  if (confirm('Tem certeza que deseja resetar a senha para este usuário?')) {
    const data = await authService.forgotPassword({ email: form.email })
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: data.message },
    }))
    closeModal()
  }
}
</script>
