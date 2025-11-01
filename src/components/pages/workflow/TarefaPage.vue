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

const tarefaFields = [
  { key: 'tarefa', label: 'Tarefa', type: 'text', rules: [v => !!v || 'Tarefa é obrigatório'], optional: false },
  {
    key: 'ctrl_processo_id',
    label: 'Processo',
    type: 'select',
    options: async () => {
      const fields = await fetchProcessos()
      return fields.filter(field => field.id !== null)
          .map(field => ({ value: field.id, text: field.processo }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Processo é obrigatório'],
    optional: false
  },

]

const userHeaders = [
  { title: 'Tarefa', value: 'tarefa' },
  { title: 'Processo', value: 'ctrl_processo_id.processo' },
  { title: '', value: 'actions'}
]
</script>