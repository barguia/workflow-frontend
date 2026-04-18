<template>
  <CrudComponent
      route="wf/forms/campos-regras"
      title="Regras de Campos"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="regras-campo-crud"
  />
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import { useCrud } from '@/services/useCrud.js'

const { index: fetchFormularios }  = useCrud('wf/forms/formularios')
const { index: fetchCampos }       = useCrud('wf/forms/campos')
const { index: fetchExpressoes }   = useCrud('wf/forms/expressoes-booleanas')

const fields = [
  {
    key: 'ctrl_formulario_id',
    label: 'Formulário',
    type: 'select',
    options: async () => {
      const rows = await fetchFormularios()
      return rows.map(r => ({ value: r.id, text: r.formulario }))
    },
    rules: [v => !!v || 'Formulário é obrigatório'],
    optional: false,
  },
  {
    key: 'ctrl_campo_id',
    label: 'Campo',
    type: 'select',
    options: async () => {
      const rows = await fetchCampos()
      return rows.map(r => ({ value: r.id, text: r.campo }))
    },
    rules: [v => v !== null && v !== undefined || 'Campo é obrigatório'],
    optional: false,
  },
  {
    key: 'ctrl_expressao_booleana_id',
    label: 'Expressão Booleana',
    type: 'select',
    options: async () => {
      const rows = await fetchExpressoes()
      return rows.map(r => ({ value: r.id, text: r.expressao ?? r.nome ?? r.operador ?? r.id }))
    },
    rules: [v => !!v || 'Expressão é obrigatória'],
    optional: false,
  },
  {
    key: 'valor',
    label: 'Valor',
    type: 'text',
    optional: true,
  },
  {
    key: 'ctrl_campo_alvo_id',
    label: 'Campo Alvo',
    type: 'select',
    options: async () => {
      const rows = await fetchCampos()
      return rows.map(r => ({ value: r.id, text: r.campo }))
    },
    rules: [v => v !== null && v !== undefined || 'Campo alvo é obrigatório'],
    optional: false,
  },
  {
    key: 'acao',
    label: 'Ação',
    type: 'text',
    optional: false,
    rules: [v => !!v || 'Ação é obrigatória'],
  },
]

const headers = [
  { title: 'Formulário',        value: 'formulario.formulario',           key: 'formulario'        },
  { title: 'Campo',             value: 'campo.campo',                     key: 'campo'             },
  { title: 'Expressão',         value: 'expressao_booleana.expressao',    key: 'expressao_booleana'},
  { title: 'Valor',             value: 'valor',                           key: 'valor'             },
  { title: 'Campo Alvo',        value: 'campo_alvo.campo',                key: 'campo_alvo'        },
  { title: 'Ação',              value: 'acao',                            key: 'acao'              },
  { title: '',                  value: 'actions'                                                   },
]
</script>
