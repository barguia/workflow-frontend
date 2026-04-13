<template>
  <CrudComponent
      route="wf/tarefas"
      title="Tarefas"
      must-sort
      :fields="tarefaFields"
      :headers="userHeaders"
      :show-select="false"
      data-testid="tarefa-crud"
  >
    <template #previewField="{ item }">
      <ButtonComponent
        icon="mdi-eye-outline"
        variant="text"
        size="small"
        color="secondary"
        :href="`/fila-tarefa/${item.id}`"
        target="_blank"
        data-testid="tarefa-btn-fila"
      />
    </template>
    <template #actionsField="{ item }">
      <ButtonComponent
        icon="mdi-transit-connection-variant"
        variant="text"
        size="small"
        color="primary"
        :href="`/mobilidade-tarefa/${item.id}`"
        target="_blank"
        data-testid="tarefa-btn-mobilidade"
      />
    </template>
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchProcessos } = useCrud('wf/processos')
const { index: fetchWorkflow } = useCrud('wf/workflows')
const { index: fetchTiposTarefa } = useCrud('wf/tarefas-tipos')

const TIPO_ESTEIRA_ID = 1

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
    onChange: async ({ setField }) => {
      setField('ctrl_processo_id', null)
    },
    defaultValue: null,
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false,
  },
  {
    key: 'ctrl_tarefa_tipo_id',
    label: 'Tipo de Tarefa',
    type: 'select',
    options: async () => {
      const tipos = await fetchTiposTarefa()
      return tipos.map(t => ({ value: t.id, text: t.tipo }))
    },
    onChange: async ({ setField }) => {
      setField('ctrl_processo_id', null)
    },
    defaultValue: null,
    rules: [v => !!v || 'Tipo de tarefa é obrigatório'],
    optional: false,
  },
  {
    key: 'ctrl_processo_id',
    label: 'Processo',
    type: 'select',
    dependsOn: 'ctrl_workflow_id',
    renderIf: f => f.ctrl_tarefa_tipo_id === TIPO_ESTEIRA_ID,
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      if (!f.ctrl_workflow_id) return []

      const processos = await fetchProcessos({ctrl_workflow_id: f.ctrl_workflow_id})
      return processos
          .map(field => ({ value: field.id, text: field.processo }));
    },
    multiple: false,
    defaultValue: null,
    rules: f => f.ctrl_tarefa_tipo_id === TIPO_ESTEIRA_ID ? [v => !!v || 'Processo é obrigatório'] : [],
    optional: false
  },
  {
    key: 'tarefa',
    label: 'tarefa',
    type: 'text',
    rules: [v => !!v || 'tarefa é obrigatório'],
    optional: false
  },
  {
    key: 'descrição',
    label: 'Descrição da tarefa',
    type: 'textarea',
    optional: true
  },

]

const userHeaders = [
  { title: '', value: 'preview' },
  { title: 'Tarefa', value: 'tarefa' },
  { title: 'Tipo', value: 'tipo_tarefa.tipo' },
  { title: 'Ordem', value: 'ordenacao' },
  { title: 'Workflow', value: 'workflow.workflow' },
  { title: 'Processo', value: 'processo.processo' },
  { title: '', value: 'actions' },
]
</script>
