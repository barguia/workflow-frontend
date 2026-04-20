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
          data-testid="campo-btn-opcoes"
          @click="openOpcoesDialog(item)"
      />
    </template>
  </CrudComponent>

  <!-- Dialog de gerenciamento de opções -->
  <v-dialog v-model="opcoesDialog" max-width="820px" scrollable @keydown.esc="opcoesDialog = false" @before-leave="() => document.activeElement?.blur()">
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="secondary" size="22">mdi-format-list-bulleted</IconComponent>
        <span class="text-h6">Opções — {{ campoAtivo?.label }}</span>
        <v-spacer />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="opcoesDialog = false" />
      </CardTitleComponent>

      <CardTextComponent class="pa-0" style="max-height: 520px; overflow-y: auto">
        <!-- Lista de opções -->
        <v-table density="compact" class="opcoes-table">
          <thead>
            <tr>
              <th class="text-left">Opção</th>
              <th style="width:120px">Valor</th>
              <th style="width:80px">Ordem</th>
              <th style="width:140px">Filtro</th>
              <th style="width:84px" />
            </tr>
          </thead>
          <tbody>
            <tr v-if="opcoes.length === 0">
              <td colspan="5" class="text-center text-medium-emphasis text-body-2 py-6">
                Nenhuma opção cadastrada.
              </td>
            </tr>
            <tr v-for="opcao in opcoes" :key="opcao.id">
              <template v-if="editandoId === opcao.id">
                <td>
                  <TextFieldComponent
                      v-model="editForm.opcao"
                      variant="plain"
                      density="compact"
                      :error-messages="validationErrors.opcao"
                      hide-details="auto"
                      @input="clearErrors"
                  />
                </td>
                <td>
                  <TextFieldComponent
                      v-model="editForm.valor"
                      variant="plain"
                      density="compact"
                      :error-messages="validationErrors.valor"
                      hide-details="auto"
                      @input="clearErrors"
                  />
                </td>
                <td>
                  <TextFieldComponent
                      v-model.number="editForm.ordem"
                      variant="plain"
                      density="compact"
                      hide-details
                      type="number"
                      min="0"
                  />
                </td>
                <td>
                  <TextFieldComponent
                      v-model="editForm.filtro"
                      variant="plain"
                      density="compact"
                      hide-details
                  />
                </td>
                <td>
                  <ButtonComponent icon="mdi-check" variant="text" size="small" color="success" @click="salvarEdicao(opcao)" />
                  <ButtonComponent icon="mdi-close" variant="text" size="small" @click="cancelarEdicao" />
                </td>
              </template>
              <template v-else>
                <td class="text-body-2">{{ opcao.opcao }}</td>
                <td><v-chip size="x-small" variant="tonal" color="secondary">{{ opcao.valor }}</v-chip></td>
                <td class="text-body-2">{{ opcao.ordem }}</td>
                <td class="text-body-2 text-medium-emphasis">{{ opcao.filtro || '—' }}</td>
                <td class="text-no-wrap">
                  <ButtonComponent icon="mdi-pencil" variant="text" size="small" color="primary" @click="iniciarEdicao(opcao)" />
                  <ButtonComponent icon="mdi-delete" variant="text" size="small" color="error" @click="removerOpcao(opcao)" />
                </td>
              </template>
            </tr>

            <!-- Linha de adição -->
            <tr class="add-row">
              <td>
                <TextFieldComponent
                    v-model="novaOpcao.opcao"
                    placeholder="Nova opção"
                    variant="plain"
                    density="compact"
                    :error-messages="validationErrors.opcao"
                    hide-details="auto"
                    @keydown.enter="adicionarOpcao"
                    @input="clearErrors"
                />
              </td>
              <td>
                <TextFieldComponent
                    v-model="novaOpcao.valor"
                    placeholder="Valor"
                    variant="plain"
                    density="compact"
                    :error-messages="validationErrors.valor"
                    hide-details="auto"
                    @keydown.enter="adicionarOpcao"
                    @input="clearErrors"
                />
              </td>
              <td>
                <TextFieldComponent
                    v-model.number="novaOpcao.ordem"
                    variant="plain"
                    density="compact"
                    hide-details
                    type="number"
                    min="0"
                    @keydown.enter="adicionarOpcao"
                />
              </td>
              <td>
                <TextFieldComponent
                    v-model="novaOpcao.filtro"
                    placeholder="Filtro"
                    variant="plain"
                    density="compact"
                    hide-details
                    @keydown.enter="adicionarOpcao"
                />
              </td>
              <td>
                <ButtonComponent
                    icon="mdi-plus"
                    variant="flat"
                    color="primary"
                    size="small"
                    :disabled="!novaOpcao.opcao || !novaOpcao.valor"
                    @click="adicionarOpcao"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
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
    key: 'grupo',
    label: 'Grupo de Controle',
    default: 'Padrão',
    type: 'text',
    optional: true
  },
  {
    key: 'valor_default',
    label: 'Valor Padrão',
    type: 'text',
    optional: true
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
  { title: 'Máscara', value: 'mascara', key: 'mascara' },
  { title: 'Grupo', value: 'grupo', key: 'grupo' },
  { title: 'Valor Padrão', value: 'valor_default', key: 'valor_default' },
  { title: '', value: 'actions' },
]

// Gerenciamento de opções
const { create: criarOpcao, update: atualizarOpcao, deleteItem: deletarOpcao } = useCrud('wf/forms/campos-opcoes')
const { validationErrors, clearErrors } = useValidationErrors()

const opcoesDialog = ref(false)
const campoAtivo = ref(null)
const opcoes = ref([])
const novaOpcao = ref({ opcao: '', valor: '', ordem: 0, filtro: '' })
const editandoId = ref(null)
const editForm = ref({ opcao: '', valor: '', ordem: 0, filtro: '' })

const openOpcoesDialog = async (item) => {
  campoAtivo.value = item
  editandoId.value = null
  novaOpcao.value = { opcao: '', valor: '', ordem: 0, filtro: '' }
  clearErrors()
  const response = await api.get(`wf/forms/campos/${item.id}`)
  opcoes.value = response.data.data.campos_opcoes ?? []
  opcoesDialog.value = true
}

const adicionarOpcao = async () => {
  if (!novaOpcao.value.opcao || !novaOpcao.value.valor) return
  const result = await criarOpcao({
    ctrl_campo_id: campoAtivo.value.id,
    opcao:  novaOpcao.value.opcao,
    valor:  novaOpcao.value.valor,
    ordem:  novaOpcao.value.ordem ?? 0,
    filtro: novaOpcao.value.filtro ?? '',
  })
  if (result?.data) {
    opcoes.value.push(result.data)
    novaOpcao.value = { opcao: '', valor: '', ordem: 0, filtro: '' }
  }
}

const iniciarEdicao = (opcao) => {
  clearErrors()
  editandoId.value = opcao.id
  editForm.value = { opcao: opcao.opcao, valor: opcao.valor, ordem: opcao.ordem ?? 0, filtro: opcao.filtro ?? '' }
}

const cancelarEdicao = () => {
  clearErrors()
  editandoId.value = null
}

const salvarEdicao = async (opcao) => {
  const result = await atualizarOpcao({
    id:            opcao.id,
    ctrl_campo_id: campoAtivo.value.id,
    opcao:         editForm.value.opcao,
    valor:         editForm.value.valor,
    ordem:         editForm.value.ordem ?? 0,
    filtro:        editForm.value.filtro ?? '',
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

<style scoped>
.opcoes-table :deep(td) {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

.opcoes-table .add-row {
  border-top: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
}

.opcoes-table .add-row td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.opcoes-table :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: unset;
}
</style>
