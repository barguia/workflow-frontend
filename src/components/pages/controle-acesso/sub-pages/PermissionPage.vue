<template>
  <CrudComponent
    route="app/permissions"
    title="Permissões"
    :fields="fields"
    :headers="headers"
    :filter_index="{guard_name: 'web'}"
    data-testid="permissao-crud"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
const fields = [
  {
    key: 'grupo',
    label: 'Grupo',
    type: 'text',
    rules: [v => !!v || 'Grupo é obrigatório'],
    optional: false
  },
  {
    key: 'name',
    label: 'Permissão',
    type: 'text',
    rules: [v => !!v || 'Permissão é obrigatório'],
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