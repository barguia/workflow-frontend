<template>
  <CrudComponent
      route="wf/forms/formularios"
      title="Formulários"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="formulario-crud"
  >
    <template #actionsField="{ item }">
      <v-btn
          icon="mdi-eye-outline"
          variant="text"
          size="small"
          color="secondary"
          title="Visualizar formulário"
          @click="abrirPreview(item)"
      />
      <v-btn
          icon="mdi-format-list-checks"
          variant="text"
          size="small"
          color="primary"
          title="Associar campos"
          @click="abrirModalCampos(item)"
      />
    </template>
  </CrudComponent>

  <UmParaMuitosComponent2
      v-if="dialog"
      v-model="dialog"
      :titulo="`Campos do formulário: ${formularioSelecionado?.formulario}`"
      :entidade-id="formularioSelecionado?.id"
      endpoint-api="wf/forms/formularios-campos"
      campo-entidade-id="ctrl_formulario_id"
      campo-ids-associados="campos_ids"
      :selecionados="camposSelecionados"
      :todos-itens="todosCampos"
      @salvo="fecharModal"
  />

  <PreviewFormularioDialog
      v-if="dialogPreview"
      v-model="dialogPreview"
      :formulario="formularioSelecionado"
  />
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'
import PreviewFormularioDialog from './PreviewFormularioDialog.vue'
import api from '@/services/api.js'

const dialog = ref(false)
const dialogPreview = ref(false)
const formularioSelecionado = ref(null)
const camposSelecionados = ref([])
const todosCampos = ref([])

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

const abrirPreview = (formulario) => {
  formularioSelecionado.value = formulario
  dialogPreview.value = true
}

const abrirModalCampos = async (formulario) => {
  const [resTodos, resAssociados] = await Promise.all([
    api.get('wf/forms/campos'),
    api.get(`wf/forms/formularios-campos/${formulario.id}`),
  ])

  todosCampos.value = [
    {
      grupo: 'Campos disponíveis',
      options: resTodos.data.data.map(c => ({ value: c.id, text: c.campo })),
    },
  ]

  camposSelecionados.value = resAssociados.data.data.map(c => c.id)
  formularioSelecionado.value = formulario
  dialog.value = true
}

const fecharModal = () => {
  dialog.value = false
  setTimeout(() => { formularioSelecionado.value = null }, 300)
}
</script>
