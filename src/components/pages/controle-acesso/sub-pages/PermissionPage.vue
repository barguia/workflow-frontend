<template>
  <CrudComponent
    route="app/permissions"
    title="Permissões"
    :fields="fields"
    :headers="headers"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

let fields;
fields = [
  {
    key: 'name',
    label: 'Permissão',
    type: 'text',
    rules: [v => !!v || 'Permissão é obrigatório'],
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
  { title: 'Permissão', value: 'name' },
  { title: 'Tipo de Permissão', value: 'guard_name' },
  { title: 'Grupo', value: 'grupo' },
  { title: '', value: 'actions'}
]
</script>