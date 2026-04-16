<template>
  <CrudComponent
      route="wf/hierarquias"
      title="Hierarquias de Processos"
      :fields="fields"
      :headers="headers"
      must-sort
      data-testid="hierarquia-crud"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
import {ref} from "vue";
const { index: fetchWorkflow } = useCrud('wf/workflows')
const { index: fetchHierarquia } = useCrud('wf/hierarquias')

const hierarquias = ref({})
const opcoesHieraquia = ref({})
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
    onChange: async ({ setField }) => {
      setField('ctrl_sub_hierarquia_id', null)
      setField('ctrl_macro_hierarquia_id', null)
      opcoesHieraquia.value = {}
    },
    defaultValue: null,
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false
  },
  {
    key: 'hierarquia',
    label: 'Nível de Hierarquia',
    type: 'text',
    defaultValue: null,
    rules: [v => !!v || 'Hierarquia é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_macro_hierarquia_id',
    label: 'Nível Macro de Hierarquia',
    type: 'select',
    dependsOn: 'ctrl_workflow_id',
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      if (!f.ctrl_workflow_id) return []
      const fields = await fetchHierarquia({ctrl_workflow_id: f.ctrl_workflow_id})
      return fields
          .map(field => ({ value: field.id, text: field.hierarquia }));
    },
    defaultValue: null,
  },
  {
    key: 'ctrl_sub_hierarquia_id',
    label: 'Sub nível de Hierarquia',
    type: 'select',
    // dependsOn: 'ctrl_workflow_id',
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      if (!f.ctrl_workflow_id) return []
      const fields = await fetchHierarquia({ctrl_workflow_id: f.ctrl_workflow_id})
      console.log(fields)
      return fields
          .map(field => ({ value: field.id, text: field.hierarquia }));
    },
    defaultValue: null,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    type: 'textarea',
    defaultValue: null,
  },

]

const headers = [
  { title: 'Hierarquia',       key: 'hierarquia' },
  { title: 'Hierarquia Macro', key: 'macro_hierarquia.hierarquia' },
  { title: 'Hierarquia Sub',   key: 'sub_hierarquia.hierarquia' },
  { title: 'Workflow',         key: 'workflow.workflow' },
  { title: '',                 key: 'actions', sortable: false },
]
</script>