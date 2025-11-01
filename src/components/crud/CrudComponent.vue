<template>
  <ContainerComponent fluid>
    <CrudDataTableComponent
        v-model:selected="selectedItems"
        :headers="headers"
        :items="items"
        :search.sync="search"
        :title="title"
        @edit="openEditModal"
    >
      <template #actions="{ item }">
        <v-icon small class="mr-2" @click="openEditModal(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </CrudDataTableComponent>
  </ContainerComponent>

  <ButtonComponent
      color="primary"
      fab
      dark
      fixed
      bottom
      left
      @click="openAddModal"
  >
    <v-icon>mdi-plus</v-icon>
  </ButtonComponent>

  <SnackbarComponent v-model="showMassActions" multi-line location="top" timeout="auto">
    <RowComponent>
      <ColComponent cols="auto">
        {{ selectedItems.length }} item(ns) selecionado(s)
      </ColComponent>
      <ColComponent cols="auto">
        <ButtonComponent text color="error" @click="deleteSelected">
          Excluir Selecionados
        </ButtonComponent>
      </ColComponent>
    </RowComponent>
  </SnackbarComponent>

  <!-- Modal para Adicionar/Editar Item -->
  <v-dialog v-model="dialog" max-width="600px" @keydown.esc="closeModal">
    <CardComponent>
      <CardTitleComponent>
        <span class="text-h5">{{ isEditing ? 'Editar ' + title.toLowerCase() : 'Adicionar ' + title.toLowerCase() }}</span>
      </CardTitleComponent>
      <CardTextComponent>
        <FormComponent ref="formRef" v-model="valid" lazy-validation>
          <template v-for="field in fields" :key="field.key">
            <TextFieldComponent
                v-if="['text', 'email', 'date', 'password'].includes(field.type || 'text')"
                v-model="form[field.key]"
                :label="field.label"
                :type="field.type || 'text'"
                :rules="field.rules"
                :error-messages="validationErrors[field.key]"
                :required="!field.optional"
            />
            <TextAreaComponent
                v-else-if="field.type === 'textarea'"
                v-model="form[field.key]"
                :label="field.label"
                :rules="field.rules"
                :error-messages="validationErrors[field.key]"
                :required="!field.optional"
            />
            <SelectComponent
                v-else-if="field.type === 'select'"
                v-model="form[field.key]"
                :label="field.label"
                :items="resolvedOptions[field.key] || []"
                :rules="field.rules"
                :multiple="field.multiple || false"
                :error-messages="validationErrors[field.key]"
                :required="!field.optional"
            />
            <RadioComponent
                v-else-if="field.type === 'radio'"
                v-model="form[field.key]"
                :label="field.label"
                :items="resolvedOptions[field.key] || []"
                :rules="field.rules"
                :inline="field.inline || false"
                :error-messages="validationErrors[field.key]"
                :required="!field.optional"
            />
            <CheckboxComponent
                v-else-if="field.type === 'checkbox'"
                v-model="form[field.key]"
                :label="field.label"
                :items="resolvedOptions[field.key] || []"
                :rules="field.rules"
                :inline="field.inline || false"
                :error-messages="validationErrors[field.key]"
                :required="!field.optional"
            />
          </template>
        </FormComponent>
      </CardTextComponent>
      <CardActionsComponent>
        <v-spacer></v-spacer>
        <ButtonComponent color="blue darken-1" text @click="closeModal">
          Cancelar
        </ButtonComponent>

        <slot name="actions" :is-editing="isEditing" :form="form" :save-item="saveItem" :close-modal="closeModal" />

        <ButtonComponent color="primary" text @click="saveItem">
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </v-dialog>
  <!-- Snackbar para Erros/Sucesso -->
  <SnackbarComponent
      v-model="showSnackbar"
      :color="snackbarMessage === 'Operação realizada com sucesso!' ? 'success' : 'error'"
      timeout="3000"
  >
    {{ snackbarMessage }}
    <template v-slot:actions>
      <ButtonComponent color="white" variant="text" @click="showSnackbar = false">
        Fechar
      </ButtonComponent>
    </template>
  </SnackbarComponent>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useCrud } from '@/services/useCrud.js'
import { useValidationErrors } from '@/composables/useValidationErrors';

import CrudDataTableComponent from './CrudDataTableComponent.vue'
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import SnackbarComponent from "@/components/comuns/alerts/SnackbarComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import CheckboxComponent from "@/components/comuns/forms/CheckboxComponent.vue";
import RadioComponent from "@/components/comuns/forms/RadioComponent.vue";
import SelectComponent from "@/components/comuns/forms/SelectComponent.vue";
import TextAreaComponent from "@/components/comuns/forms/TextAreaComponent.vue";

const props = defineProps({
  route: { type: String, required: true }, // e.g., 'users'
  title: { type: String, required: true },
  fields: {
    type: Array,
    required: true,
    default: () => [] // [{ key: 'name', label: 'Nome', type: 'text', rules: [...], optional: false }]
  },
  headers: { type: Array, required: true }, // Headers para a tabela
})

const emit = defineEmits(['item-saved', 'item-deleted'])

const items = ref([])
const selectedItems = ref([])
const search = ref('')
const dialog = ref(false)
const isEditing = ref(false)
const valid = ref(true)
const formRef = ref(null)
const form = ref({})
const resolvedOptions = ref({})
const { validationErrors, clearErrors } = useValidationErrors();

// useCrud
const { index, create, update, deleteItem: deleteServiceItem, errors, snackbarMessage, showSnackbar } = useCrud(props.route)
// const showMassActions = computed(() => selectedItems.value.length > 0)
const showMassActions = ref(false)

// Sincronizar showMassActions com selectedItems
watch(selectedItems, (newValue) => {
  showMassActions.value = newValue.length > 0
})
// Carregar itens
const loadItems = async () => {
  try {
    items.value = await index({ search: search.value })
  } catch (err) {
    // Erros tratados pelo useCrud
  }
}

onMounted(() => {
  loadItems()
})

const loadFieldOptions = async () => {
  const promises = props.fields
      .filter(field => field.options && typeof field.options === 'function')
      .map(async (field) => {
        resolvedOptions.value[field.key] = await field.options()
      })
  await Promise.all(promises)
}
// Funções
const openAddModal = async () => {
  isEditing.value = false
  form.value = {}
  props.fields.forEach(field => {
    form.value[field.key] = ''
  })

  await loadFieldOptions() // Linha potencialmente problemática
  dialog.value = true

  nextTick(() => {
    if (formRef.value?.resetValidation) {
      formRef.value.resetValidation()
    } else {
      console.warn('resetValidation não está disponível em formRef')
    }
  })
}

const openEditModal = async (item) => {
  isEditing.value = true
  form.value = { ...item } // Cópia profunda para garantir carregamento correto dos dados
  await loadFieldOptions() // Carrega opções dinâmicas
  dialog.value = true
  nextTick(() => {
    if (formRef.value?.resetValidation) {
      formRef.value.resetValidation()
    } else {
      console.warn('resetValidation não está disponível em formRef')
    }
  })
}

const closeModal = () => {
  dialog.value = false
  form.value = {}
  clearErrors()
}

const saveItem = async () => {
  try {
    let result
    if (isEditing.value) {
      result = await update({ id: form.value.id, ...form.value })
    } else {
      result = await create(form.value)
    }
    snackbarMessage.value = 'Operação realizada com sucesso!'
    showSnackbar.value = true
    closeModal()
    loadItems() // Recarregar lista
    emit('item-saved', result)
  } catch (err) {
    // console.log(err)
  }
}

const deleteItem = async (item) => {
  if (confirm(`Confirmar exclusão de ${item[Object.keys(item)[0]] || 'item'}?`)) {
    try {
      await deleteServiceItem({ id: item.id })
      snackbarMessage.value = 'Item excluído com sucesso!'
      showSnackbar.value = true
      loadItems()
      emit('item-deleted', item)
    } catch (err) {
      console.log(err)
    }
  }
}

const deleteSelected = async () => {
  if (confirm(`Confirmar exclusão de ${selectedItems.value.length} itens?`)) {
    try {
      for (const item of selectedItems.value) {
        await deleteServiceItem({ id: item.id })
      }
      snackbarMessage.value = 'Itens excluídos com sucesso!'
      showSnackbar.value = true
      selectedItems.value = []
      loadItems()
    } catch (err) {
      // Erros tratados pelo useCrud
      console.log(err)
    }
  }
}
</script>