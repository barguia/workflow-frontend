<template>
  <CrudComponent
      route="wf/forms/campos"
      title="Campos Formulário dinâmico"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="campo-crud"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import api from "@/services/api.js";
import {upperCase} from "lodash-es";
const tiposSelecionais = ['checkbox', 'select', 'radio']
const fields = [
  {
    key: 'campo',
    label: 'Campo',
    type: 'text',
    rules: [v => !!v || 'Campo é obrigatório'],
    optional: false
  },
  {
    key: 'tipo',
    label: 'Tipo de campo',
    type: 'select',
    options: async (f) => {
      const request = await api.get(`wf/forms/tipos-campos`)
      const opcoes = request.data.data
      return opcoes
        .map(field => ({ value: field, text: upperCase(field) }));
    },
  },
  {
    key: 'label',
    label: 'Label',
    type: 'text',
    rules: [v => !!v || 'Label é obrigatório'],
    optional: false
  },
  {
    key: 'placeholder',
    label: 'Placeholder',
    type: 'text',
    disabled: f => tiposSelecionais.includes(f.tipo),
    visible: f => ! tiposSelecionais.includes(f.tipo),
    optional: true
  },
  {
    key: 'mascara',
    label: 'Máscara',
    type: 'text',
    disabled: f => tiposSelecionais.includes(f.tipo),
    visible: f => ! tiposSelecionais.includes(f.tipo),
    optional: true
  },
  {
    key: 'obrigatorio',
    label: 'Obrigatório',
    type: 'radio',
    options: async () => [
      {value: 1, text: 'Sim'},
      {value: 0, text: 'Não'}
    ],
    optional: false,
  },
  {
    key: 'descricao',
    label: 'Descrição do campo',
    type: 'textarea',
    optional: false
  },
]


const headers = [
  { title: '', value: 'preview',  key: 'preview' },
  { title: 'Campo', value: 'campo',  key: 'campo' },
  { title: 'Tipo', value: 'tipo',  key: 'tipo' },
  { title: 'Label', value: 'label',  key: 'label' },
  { title: 'Placeholder', value: 'placeholder',  key: 'placeholder' },
  { title: 'Máscara', value: 'mascara',  key: 'mascara' },
  { title: '', value: 'actions' },
]
</script>
