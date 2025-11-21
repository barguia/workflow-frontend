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
    <v-dialog v-if="dialog" v-model="dialog" max-width="1000px" @keydown.esc="closeModalRole">
      <CardComponent>
        <CardTitleComponent>
          <span class="text-h5">Configuração do Perfil: {{ role.name }}</span>
        </CardTitleComponent>
        <CardTextComponent>
          <FormularioDinamico
            ref="formularioRule"
            :fields="fieldPermissions"
            v-model="form"
          />
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
import {useCrud} from "@/services/useCrud.js";
import api from "@/services/api.js";
import FormularioDinamico from "@/components/form-dinamico/FormularioDinamico.vue";
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import {useNotifications} from "@/composables/useNotifications.js";
const { triggerNotification } = useNotifications();
const { index: fetchPermissions } = useCrud('app/permissions')


const dialog = ref(false)
const form = ref({
  id: null,
  permissions_ids: []
})
const role = ref(null)
const fieldPermissions = ref([])
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
  form.value = {
    id: null,
    permissions_ids: []
  }
}

const atualizarRole = async () => {
  const payload = {
    id: form.value.id,
    permissions_ids: form.value.permissions_ids,
  }

  await api.post(`app/roles-permissions`, payload)
  closeModalRole()
}

const openModalRole = async (parametro) => {
  console.log(parametro)
  role.value = parametro
  await api.get(`app/roles-permissions/${parametro.id}`).then(response => {
    form.value = {
      id: parametro.id,
      permissions_ids: response.data.data.map((f) => f.id),
    }
  })

  fieldPermissions.value = [
    {
      key: 'permissions_ids',
      label: 'Permissões',
      type: 'combobox',
      multiple: true,
      chips: true,
      clearable: true,
      options: async () => {
        const fields = await fetchPermissions()
        return fields
            .map(field => ({
              value: field.id,
              text: field.name.replace("app.", "").replace("wf.", "") + ` (${field.guard_name})`,
              props: { subtitle: field.grupo },
            }));
      },
      optional: false
    },
  ]
  dialog.value = true
}

</script>