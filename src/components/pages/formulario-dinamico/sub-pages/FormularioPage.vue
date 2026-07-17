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
      <ButtonComponent
        icon="mdi-eye-outline"
        variant="text"
        size="small"
        color="secondary"
        title="Visualizar formulário"
        data-testid="formulario-btn-preview"
        @click="abrirPreview(item)"
      />
      <ButtonComponent
        icon="mdi-format-list-checks"
        variant="text"
        size="small"
        color="primary"
        title="Associar campos"
        data-testid="formulario-btn-campos"
        @click="abrirModalCampos(item)"
      />
      <ButtonComponent
        icon="mdi-tune"
        variant="text"
        size="small"
        color="teal"
        title="Configurar campos associados"
        data-testid="formulario-btn-pivot"
        @click="abrirModalPivot(item)"
      />
    </template>
  </CrudComponent>

  <AssociacaoCampos
    v-if="dialog"
    v-model="dialog"
    :formulario="formularioSelecionado"
    @salvo="fecharModal"
  />

  <PreviewFormularioDialog
    v-if="dialogPreview"
    v-model="dialogPreview"
    :formulario="formularioSelecionado"
  />

  <ConfiguracaoFormulario
    v-if="dialogPivot"
    v-model="dialogPivot"
    :formulario="formularioSelecionado"
  />
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import AssociacaoCampos from './AssociacaoCampos.vue'
import PreviewFormularioDialog from './PreviewFormularioDialog.vue'
import ConfiguracaoFormulario from './ConfiguracaoFormulario.vue'

const dialog        = ref(false)
const dialogPreview = ref(false)
const dialogPivot   = ref(false)
const formularioSelecionado = ref(null)

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

const abrirModalCampos = (formulario) => {
  formularioSelecionado.value = formulario
  dialog.value = true
}

const fecharModal = () => {
  dialog.value = false
  setTimeout(() => { formularioSelecionado.value = null }, 300)
}

const abrirModalPivot = (formulario) => {
  formularioSelecionado.value = formulario
  dialogPivot.value = true
}
</script>
