<template>
  <CrudComponent
    route="wf/workflows"
    title="Workflows"
    :fields="fields"
    :headers="headers"
    data-testid="workflow-crud"
  >
    <template #actionsField="{ item }">
      <ButtonComponent
        icon="mdi-transit-connection-variant"
        variant="text"
        size="small"
        color="primary"
        data-testid="workflow-btn-mobilidades"
        @click="openModalMobilidades(item)"
      />
    </template>
  </CrudComponent>

  <v-dialog
    v-if="dialog"
    v-model="dialog"
    max-width="1400px"
    scrollable
    @keydown.esc="closeModalMobilidades"
  >
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent
          color="primary"
          size="22"
        >
          mdi-transit-connection-variant
        </IconComponent>
        <span class="text-h6">Mobilidades do workflow: {{ workflowSelecionado?.workflow }}</span>
        <v-spacer />
        <ButtonComponent
          icon="mdi-close"
          variant="text"
          size="small"
          data-testid="workflow-modal-btn-fechar"
          @click="closeModalMobilidades"
        />
      </CardTitleComponent>

      <CardTextComponent class="pt-4">
        <FlowMobilidadeComponent
          v-if="workflowSelecionado"
          :ctrl-workflow-id="workflowSelecionado.id"
          height="700px"
        />
      </CardTextComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import FlowMobilidadeComponent from '@/components/pages/projeto/tarefa/FlowMobilidadeComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchOrganizacoes } = useCrud('app/organizacoes')
const { index: fetchTarefa } = useCrud('wf/tarefas')

const dialog = ref(false)
const workflowSelecionado = ref(null)

const openModalMobilidades = (item) => {
  workflowSelecionado.value = item
  dialog.value = true
}

const closeModalMobilidades = () => {
  dialog.value = false
  setTimeout(() => {
    workflowSelecionado.value = null
  }, 300)
}

const fields = [
  {
    key: 'workflow',
    label: 'Workflow',
    type: 'text',
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_default_tarefa_id',
    label: 'tarefa inicial',
    type: 'select',
    renderIf: f => f.id,
    options: async (f) => {
      const fields = await fetchTarefa({ctrl_workflow_id: f.id})
      return fields
          .map(field => ({ value: field.id, text: field.tarefa }));
    },
    defaultValue: null,
  },
  {
    key: 'acl_organizacao_id',
    label: 'Organização',
    type: 'select',
    options: async () => {
      const fields = await fetchOrganizacoes()
      return fields.filter(field => field.id !== null)
          .map(field => ({ value: field.id, text: field.razao_social }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Organização é obrigatório'],
    optional: false
  },
]

const headers = [
  { title: 'Workflow', value: 'workflow' },
  { title: 'tarefa inicial', value: 'tarefa_default.tarefa' },
  { title: 'Organização', value: 'organizacao.razao_social' },
  { title: '', value: 'actions'}
]
</script>
