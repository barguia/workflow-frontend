<template>
  <div>
    <CrudComponent
        route="app/roles"
        title="Controle de Acesso"
        :fields="fields"
        :headers="headers"
    >
      <template #actionsField="{ item }">
        <v-icon small @click="openModalRole(item)" class="ml-2">
          mdi-account-key
        </v-icon>
      </template>
    </CrudComponent>

    <v-dialog v-if="dialog" v-model="dialog" max-width="1200px" @keydown.esc="closeModalRole">
      <CardComponent>
        <CardTitleComponent>
          <span class="text-h5">Configuração do Perfil: {{ role.name }}</span>
        </CardTitleComponent>
        <CardTextComponent>
          <FormComponent v-model="form">
            <RowComponent>
              <ColComponent v-for="grupo in grupo_permissions" :key="grupo.grupo" cols="12" xs="12" sm="6" md="4" lg="3" xl="3" >
                <v-divider class="mb-3"  />
                <span class="text-h5 text-center">{{ grupo.grupo }}</span>
                <v-checkbox
                    v-for="opt in grupo.options"
                    :key="opt.value"
                    v-model="localForm.permissions_ids"
                    :value="opt.value"
                    :label="opt.text"
                    hide-details
                    density="compact"
                    class="ma-0 my-1"
                    style="height: 32px;"
                >
                  <template v-slot:label>
                    <v-chip
                        :color="localForm.permissions_ids.includes(opt.value) ? 'primary' : 'grey-lighten-2'"
                        :text="opt.text"
                        size="small"
                        class="px-2 text-caption font-weight-medium"
                    />
                  </template>
                </v-checkbox>
              </ColComponent>
            </RowComponent>

          </FormComponent>
        </CardTextComponent>
        <CardActionsComponent>
          <v-spacer></v-spacer>
          <ButtonComponent color="blue darken-1" text @click="closeModalRole">
            Cancelar
          </ButtonComponent>


          <ButtonComponent color="primary" text @click="atualizarRole">
            Salvar
          </ButtonComponent>
        </CardActionsComponent>
      </CardComponent>

    </v-dialog>
  </div>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {ref} from "vue";

import api from "@/services/api.js";
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";


const dialog = ref(false)
const grupo_permissions = ref([])

const form = ref({
  id: null,
  permissions_ids: []
})
const localForm   = ref({
  id: null,
  permissions_ids: []
})

const role = ref(null)

const fields = [
  {
    key: 'name',
    label: 'Role',
    type: 'text',
    rules: [v => !!v || 'Role é obrigatório'],
    optional: false
  },
  {
    key: 'guard_name',
    label: 'Guard Name',
    type: 'select',
    default: 'api',
    options: async () => {
      return [
        {
          value: 'api',
          text: 'API',
        },
        {
          value: 'web',
          text: 'WEB',
        },
      ]
    },
    optional: false
  },
];

const headers = [
  { title: 'Role', value: 'name' },
  { title: 'guard_name', value: 'guard_name' },
  { title: '', value: 'actions'}
]

const closeModalRole = () => {
  dialog.value = false
  role.value = null
  localForm.value.id = null
  localForm.value.permissions_ids = []  // limpa seleção
  grupo_permissions.value = []
}

const atualizarRole = async () => {
  const payload = {
    id: localForm.value.id,
    permissions_ids: localForm.value.permissions_ids,
  }

  await api.post(`app/roles-permissions`, payload)
  closeModalRole()
}

const openModalRole = async (parametro) => {
  role.value = parametro
  dialog.value = true

  // 1. Carrega as permissões que a role JÁ TEM
  const resPermissoesAtuais = await api.get(`app/roles-permissions/${parametro.id}`)
  localForm.value.permissions_ids = resPermissoesAtuais.data.data.map(p => p.id)
  localForm.value.id = parametro.id

  // 2. Carrega TODAS as permissões (para montar os checkboxes)
  const resTodasPermissoes = await api.get(`app/permissions`, {params:{guard_name: parametro.guard_name}})
  grupo_permissions.value = [] // limpa antes

  resTodasPermissoes.data.data.forEach((item) => {
    const grupoNome = item.grupo
    let grupoExistente = grupo_permissions.value.find(g => g.grupo === grupoNome)

    if (!grupoExistente) {
      grupoExistente = { grupo: grupoNome, options: [] }
      grupo_permissions.value.push(grupoExistente)
    }

    grupoExistente.options.push({
      value: item.id,
      text: `${item.name.replace("app.", "").replace("wf.", "")} (${item.guard_name})`
    })
  })

  // Ordena os grupos
  grupo_permissions.value.sort((a, b) => a.grupo.localeCompare(b.grupo))
}

</script>


<style scoped>
.permission-group-checkboxes .v-input__control {
  gap: 4px !important;
}

.permission-group-checkboxes .v-selection-control {
  margin: 0 !important;
  padding: 0 4px !important;
}

.permission-group-checkboxes .v-label {
  opacity: 1 !important;
  font-size: 13px !important;
}
</style>