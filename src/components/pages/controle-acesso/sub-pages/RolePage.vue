<template>
  <CrudComponent
    route="app/roles"
    title="Perfis de Acesso"
    :fields="fields"
    :headers="headers"
  >
    <template #actionsField="{ item }">
      <ButtonComponent icon="mdi-account-key" variant="text" size="small" color="primary" @click="openModalRole(item)" />
    </template>
  </CrudComponent>

  <v-dialog v-if="dialog" v-model="dialog" max-width="1200px" scrollable @keydown.esc="closeModalRole">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">mdi-shield-key-outline</IconComponent>
        <span class="text-h6">Permissões do perfil: {{ role?.name }}</span>
        <v-spacer />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="closeModalRole" />
      </CardTitleComponent>

      <CardTextComponent class="pt-4">
        <RowComponent>
          <ColComponent
            v-for="grupo in grupo_permissions"
            :key="grupo.grupo"
            cols="12" sm="6" md="4" lg="3"
          >
            <div class="text-subtitle-2 font-weight-bold text-primary mb-1">{{ grupo.grupo }}</div>
            <v-divider class="mb-3" />

            <v-checkbox
              v-for="opt in grupo.options"
              :key="opt.value"
              v-model="localForm.permissions_ids"
              :value="opt.value"
              :label="opt.text"
              hide-details
              density="compact"
              color="primary"
              class="my-1"
            />
          </ColComponent>

          <ColComponent v-if="grupo_permissions.length === 0" cols="12">
            <p class="text-body-2 text-medium-emphasis text-center py-6">
              Carregando permissões…
            </p>
          </ColComponent>
        </RowComponent>
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <v-spacer />
        <ButtonComponent variant="text" @click="closeModalRole">Cancelar</ButtonComponent>
        <ButtonComponent color="primary" variant="flat" :loading="salvando" @click="atualizarRole">
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import api from '@/services/api.js'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'

const dialog = ref(false)
const salvando = ref(false)
const grupo_permissions = ref([])
const role = ref(null)

const localForm = ref({ id: null, permissions_ids: [] })

const fields = [
  { key: 'name',       label: 'Role',       type: 'text',   rules: [v => !!v || 'Role é obrigatório'] },
  {
    key: 'guard_name', label: 'Guard Name', type: 'select',
    options: async () => [
      { value: 'api', text: 'API' },
      { value: 'web', text: 'WEB' },
    ],
  },
]

const headers = [
  { title: 'Role',       value: 'name' },
  { title: 'Guard Name', value: 'guard_name' },
  { title: '',           value: 'actions' },
]

const openModalRole = async (parametro) => {
  role.value = parametro
  localForm.value = { id: parametro.id, permissions_ids: [] }
  grupo_permissions.value = []
  dialog.value = true

  const [resAtuais, resTodas] = await Promise.all([
    api.get(`app/roles-permissions/${parametro.id}`),
    api.get('app/permissions', { params: { guard_name: parametro.guard_name } }),
  ])

  localForm.value.permissions_ids = resAtuais.data.data.map(p => p.id)

  resTodas.data.data.forEach((item) => {
    const grupoNome = item.grupo
    let grupo = grupo_permissions.value.find(g => g.grupo === grupoNome)
    if (!grupo) {
      grupo = { grupo: grupoNome, options: [] }
      grupo_permissions.value.push(grupo)
    }
    grupo.options.push({
      value: item.id,
      text: `${item.name.replace('app.', '').replace('wf.', '')} (${item.guard_name})`,
    })
  })

  grupo_permissions.value.sort((a, b) => a.grupo.localeCompare(b.grupo))
}

const atualizarRole = async () => {
  salvando.value = true
  try {
    await api.post('app/roles-permissions', {
      id: localForm.value.id,
      permissions_ids: localForm.value.permissions_ids,
    })
    closeModalRole()
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: 'Permissões atualizadas com sucesso!' },
    }))
  } finally {
    salvando.value = false
  }
}

const closeModalRole = () => {
  dialog.value = false
  setTimeout(() => {
    role.value = null
    localForm.value = { id: null, permissions_ids: [] }
    grupo_permissions.value = []
  }, 300)
}
</script>
