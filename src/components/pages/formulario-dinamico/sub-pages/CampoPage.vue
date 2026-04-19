<template>
  <CrudComponent
      route="wf/forms/campos"
      title="Campos Formulário dinâmico"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="campo-crud"
  >
    <template #actionsField="{ item }">
      <ButtonComponent
          v-if="tiposSelecionais.includes(item.tipo)"
          icon="mdi-format-list-bulleted"
          variant="text"
          size="small"
          color="secondary"
          title="Gerenciar opções"
          @click="openOpcoesDialog(item)"
      />
    </template>
  </CrudComponent>

  <!-- Dialog de gerenciamento de opções -->
  <v-dialog v-model="opcoesDialog" max-width="620px" scrollable @keydown.esc="opcoesDialog = false">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="secondary" size="22">mdi-format-list-bulleted</IconComponent>
        <span class="text-h6">Opções — {{ campoAtivo?.label }}</span>
        <v-spacer />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="opcoesDialog = false" />
      </CardTitleComponent>

      <CardTextComponent style="max-height: 480px; overflow-y: auto">
        <!-- Lista de opções existentes -->
        <v-list lines="one" class="pa-0">
          <v-list-item
              v-for="opcao in opcoes"
              :key="opcao.id"
              class="px-0"
          >
            <template v-if="editandoId === opcao.id">
              <div class="d-flex align-start ga-2 py-1">
                <TextFieldComponent
                    v-model="editForm.opcao"
                    label="Opção"
                    density="compact"
                    :error-messages="validationErrors.opcao"
                    class="flex-grow-1"
                    @input="clearErrors"
                />
                <TextFieldComponent
                    v-model="editForm.valor"
                    label="Valor"
                    density="compact"
                    :error-messages="validationErrors.valor"
                    style="max-width: 120px"
                    @input="clearErrors"
                />
                <ButtonComponent icon="mdi-check" variant="text" size="small" color="success" class="mt-1" @click="salvarEdicao(opcao)" />
                <ButtonComponent icon="mdi-close" variant="text" size="small" class="mt-1" @click="cancelarEdicao" />
              </div>
            </template>
            <template v-else>
              <div class="d-flex align-center ga-2">
                <span class="flex-grow-1 text-body-2">{{ opcao.opcao }}</span>
                <v-chip size="x-small" variant="tonal" color="secondary">{{ opcao.valor }}</v-chip>
                <ButtonComponent icon="mdi-pencil" variant="text" size="small" color="primary" @click="iniciarEdicao(opcao)" />
                <ButtonComponent icon="mdi-delete" variant="text" size="small" color="error" @click="removerOpcao(opcao)" />
              </div>
            </template>
          </v-list-item>

          <v-list-item v-if="opcoes.length === 0" class="px-0">
            <span class="text-body-2 text-medium-emphasis">Nenhuma opção cadastrada.</span>
          </v-list-item>
        </v-list>

        <v-divider class="my-4" />

        <!-- Formulário para adicionar nova opção -->
        <div class="text-caption font-weight-bold text-uppercase mb-3 text-medium-emphasis">
          Adicionar opção
        </div>
        <div class="d-flex align-start ga-2">
          <TextFieldComponent
              v-model="novaOpcao.opcao"
              label="Opção"
              density="compact"
              :error-messages="validationErrors.opcao"
              class="flex-grow-1"
              @keydown.enter="adicionarOpcao"
              @input="clearErrors"
          />
          <TextFieldComponent
              v-model="novaOpcao.valor"
              label="Valor"
              density="compact"
              :error-messages="validationErrors.valor"
              style="max-width: 120px"
              @keydown.enter="adicionarOpcao"
              @input="clearErrors"
          />
          <ButtonComponent
              icon="mdi-plus"
              variant="flat"
              color="primary"
              size="small"
              class="mt-1"
              :disabled="!novaOpcao.opcao || !novaOpcao.valor"
              @click="adicionarOpcao"
          />
        </div>
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <v-spacer />
        <ButtonComponent variant="flat" color="primary" @click="opcoesDialog = false">
          Fechar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import api from '@/services/api.js'
import { useCrud } from '@/services/useCrud.js'
import { useValidationErrors } from '@/composables/useValidationErrors.js'
import { upperCase } from 'lodash-es'

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
    options: async () => {
      const request = await api.get('wf/forms/tipos-campos')
      const opcoes = request.data.data
      return opcoes.map(field => ({ value: field, text: upperCase(field) }))
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
    visible: f => !tiposSelecionais.includes(f.tipo),
    optional: true
  },
  {
    key: 'mascara',
    label: 'Máscara',
    type: 'text',
    disabled: f => tiposSelecionais.includes(f.tipo),
    visible: f => !tiposSelecionais.includes(f.tipo),
    optional: true
  },
  {
    key: 'obrigatorio',
    label: 'Obrigatório',
    type: 'radio',
    options: async () => [
      { value: 1, text: 'Sim' },
      { value: 0, text: 'Não' }
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
  { title: '', value: 'preview', key: 'preview' },
  { title: 'Campo', value: 'campo', key: 'campo' },
  { title: 'Tipo', value: 'tipo', key: 'tipo' },
  { title: 'Label', value: 'label', key: 'label' },
  { title: 'Placeholder', value: 'placeholder', key: 'placeholder' },
  { title: 'Máscara', value: 'mascara', key: 'mascara' },
  { title: '', value: 'actions' },
]

// Gerenciamento de opções
const { create: criarOpcao, update: atualizarOpcao, deleteItem: deletarOpcao } = useCrud('wf/forms/campos-opcoes')
const { validationErrors, clearErrors } = useValidationErrors()

const opcoesDialog = ref(false)
const campoAtivo = ref(null)
const opcoes = ref([])
const novaOpcao = ref({ opcao: '', valor: '' })
const editandoId = ref(null)
const editForm = ref({ opcao: '', valor: '' })

const openOpcoesDialog = async (item) => {
  campoAtivo.value = item
  editandoId.value = null
  novaOpcao.value = { opcao: '', valor: '' }
  clearErrors()
  const response = await api.get(`wf/forms/campos/${item.id}`)
  opcoes.value = response.data.data.campos_opcoes ?? []
  opcoesDialog.value = true
}

const adicionarOpcao = async () => {
  if (!novaOpcao.value.opcao || !novaOpcao.value.valor) return
  const result = await criarOpcao({
    ctrl_campo_id: campoAtivo.value.id,
    opcao: novaOpcao.value.opcao,
    valor: novaOpcao.value.valor,
  })
  if (result?.data) {
    opcoes.value.push(result.data)
    novaOpcao.value = { opcao: '', valor: '' }
  }
}

const iniciarEdicao = (opcao) => {
  clearErrors()
  editandoId.value = opcao.id
  editForm.value = { opcao: opcao.opcao, valor: opcao.valor }
}

const cancelarEdicao = () => {
  clearErrors()
  editandoId.value = null
}

const salvarEdicao = async (opcao) => {
  const result = await atualizarOpcao({
    id: opcao.id,
    ctrl_campo_id: campoAtivo.value.id,
    opcao: editForm.value.opcao,
    valor: editForm.value.valor,
  })
  if (result) {
    const idx = opcoes.value.findIndex(o => o.id === opcao.id)
    if (idx !== -1) opcoes.value[idx] = { ...opcoes.value[idx], ...editForm.value }
    editandoId.value = null
  }
}

const removerOpcao = async (opcao) => {
  if (!confirm(`Remover a opção "${opcao.opcao}"?`)) return
  await deletarOpcao({ id: opcao.id })
  opcoes.value = opcoes.value.filter(o => o.id !== opcao.id)
}
</script>
