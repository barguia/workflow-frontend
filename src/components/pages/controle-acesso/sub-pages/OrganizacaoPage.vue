<template>
  <CrudComponent
      route="app/organizacoes"
      title="Organizações"
      :fields="fields"
      :headers="headers"
      data-testid="organizacao-crud"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'

let fields;
fields = [
  {
    key: 'razao_social',
    label: 'Razão Social',
    type: 'text',
    rules: [v => !!v || 'Razão Social é obrigatório'],
    optional: false
  },
  {
    key: 'nome_fantasia',
    label: 'Nome Fantasia',
    type: 'text',
    rules: [v => !!v || 'Nome Fantasia é obrigatório'],
    optional: false
  },
  {
    key: 'cnpj',
    label: 'CNPJ',
    type: 'text',
    rules: [v => !!v || 'CNPJ é obrigatório'],
    optional: false
  },
  {
    key: 'email',
    label: 'E-mail',
    type: 'email',
    rules: [v => !!v || 'E-mail é obrigatório'],
    optional: false
  },

  {
    key: 'cidade',
    label: 'Cidade',
    type: 'text',
    rules: [v => !!v || 'Cidiade é obrigatório'],
    optional: false
  },
  {
    key: 'uf',
    label: 'UF',
    type: 'text',
    rules: [v => !!v || 'UF é obrigatório'],
    optional: false
  },

  {
    key: 'data_expiracao',
    label: 'Data Expiração',
    type: 'text',
    optional: true
  },


  {
    key: 'descricao',
    label: 'Descrição',
    type: 'textarea',
    optional: true
  },
];

const headers = [
  { title: 'Organização', value: 'nome_fantasia' },
  { title: 'CNPJ', value: 'cnpj' },
  { title: 'E-mail', value: 'email' },
  { title: 'Telefone', value: 'telefone' },
  { title: 'Cidade', value: 'cidade' },
  { title: 'SP', value: 'uf' },
  { title: '', value: 'actions'}
]
</script>