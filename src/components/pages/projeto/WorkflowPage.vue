<template>
  <CrudComponent
      route="wf/workflows"
      title="Workflows"
      :fields="fields"
      :headers="headers"
      data-testid="workflow-crud"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchOrganizacoes } = useCrud('app/organizacoes')
const { index: fetchTarefa } = useCrud('wf/tarefas')

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
