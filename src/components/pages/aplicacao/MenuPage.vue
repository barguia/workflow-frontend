<template>
  <CrudComponent
      route="app/menus"
      title="Menus"
      :fields="userFields"
      :headers="userHeaders"
      has-reset-password
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

const userFields = [
  { key: 'menu', label: 'Menu', type: 'text', optional: false },
  { key: 'icon', label: 'MDI Icon', type: 'text', optional: false },
  { key: 'ordem', label: 'Ordenação', type: 'number', optional: true },
  { key: 'acl_page_menu_id', label: 'Página Vue', type: 'select', optional: false }
]

const userHeaders = [
  { text: 'Menu', value: 'menu' },
  { text: 'MDI Icon', value: 'icon' },
  { text: 'Ordenacao', value: 'ordem' },
  { text: 'Página Vue', value: 'acl_page_menu_id' },
  { text: 'Ações', value: 'actions', sortable: false }
]
</script>