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

  <!-- Dialog de configuração do pivot -->
  <v-dialog v-model="dialogPivot" max-width="900px" scrollable @keydown.esc="dialogPivot = false" @before-leave="() => document.activeElement?.blur()">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="teal" size="22">mdi-tune</IconComponent>
        <span class="text-h6">Configurar campos: {{ formularioSelecionado?.formulario }}</span>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="dialogPivot = false" />
      </CardTitleComponent>

      <CardTextComponent class="pa-0" style="max-height: 560px; overflow-y: auto">
        <ProgressLinearComponent v-if="carregandoPivot" indeterminate color="teal" />

        <p v-else-if="camposPivot.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo associado a este formulário.
        </p>

        <v-table v-else density="comfortable">
          <thead>
            <tr>
              <th class="text-left">Campo</th>
              <th style="width:100px">Tipo</th>
              <th style="width:80px">Cols</th>
              <th style="width:90px">Ordem</th>
              <th style="width:200px">Valor default</th>
              <th class="text-center" style="width:90px">Múltiplo</th>
              <th class="text-center" style="width:100px">Obrigatório</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="campo in camposPivot" :key="campo.pivot.id">
              <td>
                <span class="font-weight-medium text-body-2">{{ campo.label }}</span>
                <span class="text-caption text-medium-emphasis ml-1">{{ campo.campo }}</span>
              </td>
              <td>
                <v-chip size="x-small" variant="tonal" color="teal">{{ campo.tipo }}</v-chip>
              </td>
              <td>
                <TextFieldComponent
                    v-model.number="campo.pivot.cols"
                    density="compact"
                    hide-details
                    type="number"
                    min="1"
                    max="12"
                />
              </td>
              <td>
                <TextFieldComponent
                    v-model.number="campo.pivot.ordem"
                    density="compact"
                    hide-details
                    type="number"
                />
              </td>
              <td>
                <TextFieldComponent
                    v-model="campo.pivot.valor_default"
                    density="compact"
                    hide-details
                />
              </td>
              <td class="text-center">
                <v-checkbox
                    v-if="campo.tipo === 'select'"
                    v-model="campo.pivot.select_multiplo"
                    :true-value="1"
                    :false-value="0"
                    hide-details
                    density="compact"
                    color="teal"
                />
              </td>
              <td class="text-center">
                <v-checkbox
                    v-model="campo.pivot.obrigatorio"
                    :true-value="1"
                    :false-value="0"
                    hide-details
                    density="compact"
                    color="teal"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <v-spacer />
        <ButtonComponent variant="text" @click="dialogPivot = false">Cancelar</ButtonComponent>
        <ButtonComponent variant="flat" color="teal" :loading="salvandoTodos" @click="salvarTodosPivots">
          Salvar tudo
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'
import PreviewFormularioDialog from './PreviewFormularioDialog.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import api from '@/services/api.js'

const dialog = ref(false)
const dialogPreview = ref(false)
const dialogPivot = ref(false)
const formularioSelecionado = ref(null)
const camposSelecionados = ref([])
const todosCampos = ref([])
const camposPivot = ref([])
const carregandoPivot = ref(false)
const salvandoTodos = ref(false)

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

  const grupos = []
  for (const c of resTodos.data.data) {
    const nomeGrupo = c.grupo || 'Sem grupo'
    let grupo = grupos.find(g => g.grupo === nomeGrupo)
    if (!grupo) {
      grupo = { grupo: nomeGrupo, options: [] }
      grupos.push(grupo)
    }
    grupo.options.push({ value: c.id, text: c.campo })
  }
  grupos.sort((a, b) => a.grupo.localeCompare(b.grupo))
  todosCampos.value = grupos

  camposSelecionados.value = resAssociados.data.data.map(c => c.id)
  formularioSelecionado.value = formulario
  dialog.value = true
}

const fecharModal = () => {
  dialog.value = false
  setTimeout(() => { formularioSelecionado.value = null }, 300)
}

const abrirModalPivot = async (formulario) => {
  formularioSelecionado.value = formulario
  camposPivot.value = []
  carregandoPivot.value = true
  dialogPivot.value = true
  try {
    const res = await api.get(`wf/forms/formularios-campos/${formulario.id}`)
    camposPivot.value = res.data.data ?? []
  } finally {
    carregandoPivot.value = false
  }
}

const salvarTodosPivots = async () => {
  salvandoTodos.value = true
  try {
    await Promise.all(
      camposPivot.value.map(campo =>
        api.put(`wf/forms/formularios-campos/${campo.pivot.id}`, {
          id:              campo.pivot.id,
          cols:            campo.pivot.cols,
          ordem:           campo.pivot.ordem,
          valor_default:   campo.pivot.valor_default,
          select_multiplo: campo.pivot.select_multiplo,
          obrigatorio:     campo.pivot.obrigatorio,
        })
      )
    )
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: 'Configurações salvas com sucesso!' },
    }))
    dialogPivot.value = false
  } finally {
    salvandoTodos.value = false
  }
}
</script>
