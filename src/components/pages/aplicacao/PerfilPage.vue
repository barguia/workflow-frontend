<template>
  <CrudComponent
      route="app/perfis"
      title="Perfis"
      :fields="fieldsDatatable"
      :headers="headersDatatable"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

const fieldsDatatable = [
  { key: 'perfil', label: 'Perfil', type: 'text', optional: false },
  { key: 'descricao', label: 'Descrição', type: 'text', optional: true },
]

const headersDatatable = [
  { title: 'Perfil', value: 'perfil' },
  { title: 'Descrição', value: 'descricao' },
  { title: '', value: 'actions', sortable: false }
]
</script>