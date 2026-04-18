<template>
  <CrudComponent
      route="wf/forms/formularios"
      title="Formulários"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="formulario-crud"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

const fields = [
  {
    key: 'formulario',
    label: 'Formulário',
    type: 'text',
    rules: [v => !!v || 'Formulário é obrigatório'],
    optional: false,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    type: 'textarea',
    optional: true,
  },
]

const headers = [
  { title: 'Formulário', value: 'formulario', key: 'formulario' },
  { title: 'Descrição',  value: 'descricao',  key: 'descricao'  },
  { title: '',           value: 'actions'                        },
]
</script>
