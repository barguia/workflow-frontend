<template>
  <CrudComponent
      route="wf/workflows"
      title="Workflows"
      :fields="fields"
      :headers="headers"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
const { index: fetchOrganizacoes } = useCrud('app/organizacoes')

const fields = [
  { key: 'workflow', label: 'Workflow', type: 'text', rules: [v => !!v || 'Workflow é obrigatório'], optional: false },
  {
    key: 'acl_organizacao_id',
    label: 'Organização',
    type: 'select',
    options: async () => {
      const organizacoes = await fetchOrganizacoes()
      return organizacoes.filter(organizacao => organizacao.id !== null)
          .map(organizacao => ({ value: organizacao.id, text: organizacao.organizacao }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Organização é obrigatório'],
    optional: false
  },
]

const headers = [
  { title: 'Workflow', value: 'workflow' },
  { title: 'Organização', value: 'organizacao.organizacao' },
  { title: '', value: 'actions'}
]
</script>