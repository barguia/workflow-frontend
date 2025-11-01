<template>
  <CrudComponent
      route="wf/processos"
      title="Processos"
      :fields="fields"
      :headers="headers"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchWorkflow } = useCrud('wf/workflows')
const { index: fetchHierarquia } = useCrud('wf/hierarquias')

const fields = [
  { key: 'processo', label: 'Processo', type: 'text', rules: [v => !!v || 'Processo é obrigatório'], optional: false },
  {
    key: 'ctrl_hierarquia_id',
    label: 'Hierarquia',
    type: 'select',
    options: async () => {
      const fields = await fetchHierarquia()
      return fields.filter(field => field.id !== null)
          .map(field => ({ value: field.id, text: field.hierarquia }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Hierarquia é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_workflow_id',
    label: 'Workflow',
    type: 'select',
    options: async () => {
      const workflows = await fetchWorkflow()
      return workflows.filter(workflow => workflow.id !== null)
          .map(workflow => ({ value: workflow.id, text: workflow.workflow }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false
  },
]

const headers = [
  { title: 'Processo', value: 'processo' },
  { title: 'Hierarquia', value: 'hierarquia.hierarquia' },
  { title: 'Workflow', value: 'workflow.workflow' },
  { title: '', value: 'actions'}
]
</script>