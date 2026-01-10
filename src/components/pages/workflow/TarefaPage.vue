<template>
  <CrudComponent
      route="wf/tarefas"
      title="Tarefas"
      :fields="tarefaFields"
      :headers="userHeaders"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchProcessos } = useCrud('wf/processos')
const { index: fetchWorkflow } = useCrud('wf/workflows')

const tarefaFields = [
  {
    key: 'ctrl_workflow_id',
    label: 'Workflow',
    type: 'select',
    options: async () => {
      const workflows = await fetchWorkflow()
      return workflows
          .map(workflow => ({ value: workflow.id, text: workflow.workflow }));
    },
    onChange: async ({ setField , form}) => {
      setField('ctrl_processo_id', null)
    },
    defaultValue: null,
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false,
  },
  {
    key: 'ctrl_processo_id',
    label: 'Processo',
    type: 'select',
    // dependsOn: 'ctrl_workflow_id',
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      if (!f.ctrl_workflow_id) return []

      const processos = await fetchProcessos({ctrl_workflow_id: f.ctrl_workflow_id})
      return processos
          .map(field => ({ value: field.id, text: field.processo }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Processo é obrigatório'],
    optional: false
  },
  {
    key: 'tarefa',
    label: 'Tarefa',
    type: 'text',
    rules: [v => !!v || 'Tarefa é obrigatório'],
    optional: false
  },
  {
    key: 'descrição',
    label: 'Descrição da Tarefa',
    type: 'textarea',
    optional: true
  },

]

const userHeaders = [
  { title: 'Workflow', value: 'workflow.workflow' },
  { title: 'Processo', value: 'processo.processo' },
  { title: 'Tarefa', value: 'tarefa' },
  { title: '', value: 'actions'}
]
</script>