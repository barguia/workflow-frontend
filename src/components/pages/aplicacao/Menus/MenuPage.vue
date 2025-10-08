<template>
  <CrudComponent
      route="app/menus"
      title="Menus"
      :fields="menuFields"
      :headers="menuHeaders"
  />
</template>

<script setup>
import { useCrud } from '@/services/useCrud.js'
import CrudComponent from "@/components/crud/CrudComponent.vue";

const { index: fetchMenus } = useCrud('app/menus') // Para opções de select/radio/checkbox
const { index: fetchPaginasMenus } = useCrud('app/pages-menu')

const menuFields = [
  { key: 'menu', label: 'Titulo menu', type: 'text', rules: [v => !!v || 'Nome é obrigatório'], optional: false },
  {
    key: 'acl_menu_id',
    label: 'Menu Pai',
    type: 'select',
    options: async () => {
      const menus = await fetchMenus()
      return menus.filter(menu => menu.acl_page_menu_id === null)
          .map(menu => ({ value: menu.id, text: menu.menu }));
    },
    multiple: false,
    defaultValue: null, // Ou um ID default
    rules: [v => !!v || 'Menu Pai é obrigatório'],
    optional: false
  },
  {
    key: 'acl_page_menu_id',
    label: 'Página Associada',
    type: 'select',
    options: async () => {
      const paginas = await fetchPaginasMenus()

      return paginas
          .map(pagina => ({ value: pagina.id, text: pagina.path })) // Formato { value, text }
    },
    inline: true,
    defaultValue: null, // Valor default
    optional: false
  },
  {
    key: 'permissions',
    label: 'Permissões',
    type: 'checkbox',
    options: [ // Estático, ou dinâmico via API
      { value: 'read', text: 'Leitura' },
      { value: 'write', text: 'Escrita' },
      { value: 'delete', text: 'Exclusão' }
    ],
    multiple: true, // Para checkbox, v-model será array
    inline: true,
    defaultValue: ['read'], // Array default
    rules: [v => v.length > 0 || 'Selecione ao menos uma permissão'],
    optional: false
  }
]

const menuHeaders = [
  { text: 'Titulo Menu', value: 'menu' },
  { text: 'Tipo de Menu', value: 'acl_menu_pai.menu' },
  { text: 'Página Associada', value: 'page_menu.path' },
  { text: 'Permissões', value: 'permissions' },
  { text: 'Ações', value: 'actions', sortable: false }
]
</script>