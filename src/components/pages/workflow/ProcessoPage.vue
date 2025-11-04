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
import {ref} from "vue";
const { index: fetchWorkflow } = useCrud('wf/workflows')
const { index: fetchHierarquia } = useCrud('wf/hierarquias')
const { index: fetchProcesso } = useCrud('wf/processos')
const form = ref({})

const fields = [
  {
    key: 'ctrl_workflow_id',
    label: 'Workflow',
    type: 'select',
    options: async () => {
      const workflows = await fetchWorkflow()
      return workflows
          .map(workflow => ({ value: workflow.id, text: workflow.workflow }));
    },
    defaultValue: null,
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_hierarquia_id',
    label: 'Nível de Hierarquia',
    type: 'select',
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      const fields = await fetchHierarquia({ctrl_workflow_id: f.ctrl_workflow_id})
      return fields.filter(field => field.id !== null)
          .map(field => ({ value: field.id, text: field.hierarquia }));
    },
    defaultValue: null,
    rules: [v => !!v || 'Hierarquia é obrigatório'],
    optional: false
  },
  { key: 'processo', label: 'Processo', type: 'text', rules: [v => !!v || 'Processo é obrigatório'], optional: false },

  {
    key: 'ctrl_processo_id',
    label: 'Processo Relacionado',
    type: 'select',
    disabled: f => !f.ctrl_hierarquia_id,
    options: async (f) => {
      if (!f.ctrl_hierarquia_id) return []
      const data = await fetchProcesso({ ctrl_hierarquia_id: f.ctrl_hierarquia_id })
      return data.map(d => ({ value: d.id, text: d.processo }))
    }
  },
]

const headers = [
  { title: 'Processo', value: 'processo' },
  { title: 'Hierarquia', value: 'hierarquia.hierarquia' },
  { title: 'Workflow', value: 'workflow.workflow' },
  { title: '', value: 'actions'}
]
</script>