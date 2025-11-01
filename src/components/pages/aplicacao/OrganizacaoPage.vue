<template>
  <CrudComponent
      route="app/organizacoes"
      title="Organizações"
      :fields="fields"
      :headers="headers"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

const fields = [
  { key: 'organizacao', label: 'Organização', type: 'text', rules: [v => !!v || 'Organização é obrigatório'], optional: false },
  { key: 'descricao', label: 'Descrição', type: 'textarea', optional: true },
]

const headers = [
  { title: 'Organização', value: 'organizacao' },
  { title: 'Descrição', value: 'descricao' },
  { title: '', value: 'actions'}
]
</script>