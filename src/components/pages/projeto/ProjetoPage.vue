<template>
  <CrudComponent
      route="wf/projetos"
      title="Gestão de Projetos"
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="projeto-crud"
  >
    <template #previewField="{ item }">
      <ButtonComponent
        icon="mdi-eye-outline"
        variant="text"
        size="small"
        color="secondary"
        :href="`/ficha-tecnica/${item.id}`"
        target="_blank"
        data-testid="projeto-btn-ficha-tecnica"
      />
    </template>
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'

const fields = [
  {
    key: 'nome',
    label: 'Nome do Projeto',
    type: 'text',
    rules: [v => !!v || 'Nome do Projeto é obrigatório'],
    optional: false,
    col: 8,
  },
  {
    key: 'prioridade',
    label: 'Prioridade',
    type: 'select',
    options: async () => [
      { text: 'Baixa', value: 'baixa' },
      { text: 'Média', value: 'media' },
      { text: 'Alta', value: 'alta' },
    ],
    optional: false,
    col: 4,
  },
  {
    key: 'data_inicio',
    label: 'Inicio do Projeto',
    type: 'date',
    col: 3,
  },
  {
    key: 'data_fim',
    label: 'Término do Projeto',
    type: 'date',
    col: 3,
  },
  {
    key: 'descricao',
    label: 'Descrição do Projeto',
    type: 'textarea',
    optional: false,
  },
]

const headers = [
  { title: '', value: 'preview' },
  { title: 'WF-id', value: 'workflow.id' },
  { title: 'Projeto', value: 'nome' },
  { title: 'Inicio', value: 'data_inicio' },
  { title: 'Término', value: 'data_fim' },
  { title: '', value: 'actions' },
]
</script>
