<template>
  <ContainerComponent fluid>
    <CrudDataTableComponent
        v-model:selected="selectedItems"
        :headers="headers"
        :items="items"
        :search.sync="search"
        :title="title"
        :show-select="showSelect"
        @edit="openEditModal"
    >
      <template #preview="{ item }">
        <slot name="previewField" :item="item" />
      </template>
      <template #actions="{ item }">
        <ButtonComponent icon="mdi-pencil"  variant="text" size="small" color="primary" @click="openEditModal(item)" />
        <ButtonComponent icon="mdi-delete"  variant="text" size="small" color="error"   @click="deleteItem(item)" />
        <slot name="actionsField" :item="item"/>
      </template>
    </CrudDataTableComponent>
  </ContainerComponent>

  <ButtonComponent
      color="primary"
      icon="mdi-plus"
      size="large"
      position="fixed"
      location="bottom right"
      class="ma-6"
      elevation="4"
      @click="openAddModal"
  />

  <SnackbarComponent
    v-model="showMassActions"
    location="bottom"
    timeout="-1"
    color="surface"
    rounded="lg"
    elevation="6"
    class="mass-action-bar"
  >
    <div class="d-flex align-center ga-3">
      <IconComponent color="primary" size="18">mdi-checkbox-marked-circle-outline</IconComponent>
      <span class="text-body-2 font-weight-medium">{{ selectedItems.length }} item(ns) selecionado(s)</span>
      <v-spacer />
      <ButtonComponent variant="text" color="error" size="small" @click="deleteSelected">
        <IconComponent start size="16">mdi-delete-outline</IconComponent>
        Excluir
      </ButtonComponent>
    </div>
  </SnackbarComponent>

  <!-- Modal para Adicionar/Editar Item -->
  <v-dialog v-model="dialog" max-width="1000px" @keydown.esc="closeModal" scrollable>
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">{{ isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline' }}</IconComponent>
        <span class="text-h6">{{ isEditing ? 'Editar ' + title : 'Adicionar ' + title }}</span>
        <v-spacer />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="closeModal" />
      </CardTitleComponent>
      <CardTextComponent>
        <FormularioDinamico
            ref="formularioRef"
            :fields="fields"
            v-model="form"
            :validationErrors="validationErrors"
            :is-editing="isEditing"
            :resolvedOptions="resolvedOptions"
            :context="props.context"
        />
      </CardTextComponent>
      <CardActionsComponent class="px-6 py-4 border-t">
        <v-spacer />
        <ButtonComponent variant="text" @click="closeModal">
          Cancelar
        </ButtonComponent>

        <slot name="actions" :is-editing="isEditing" :form="form" :save-item="saveItem" :close-modal="closeModal" />

        <ButtonComponent color="primary" variant="flat" @click="saveItem">
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
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import FormularioDinamico from "@/components/form-dinamico/FormularioDinamico.vue"
import IconComponent from "@/components/comuns/icons/IconComponent.vue";

const props = defineProps({
  route: { type: String, required: true },
  filter_index: { type: Object, required: false, default: {} },
  title: { type: String, required: true },
  form: { type: Object, default: () => ({}) },
  fields: {
    type: Array,
    required: true,
    default: () => []
  },
  headers: { type: Array, required: true }, // Headers para a tabela
  context: { type: Object, default: () => ({}) },
  showSelect: { type: Boolean, default: true },
  onEdit: { type: Function, default: null },
})

const emit = defineEmits(['item-saved', 'item-deleted'])

const items = ref([])
const selectedItems = ref([])
const search = ref('')
const dialog = ref(false)
const isEditing = ref(false)
const formularioRef = ref(null)
const form = ref({})
const resolvedOptions = ref({})
const { validationErrors, clearErrors } = useValidationErrors();

// useCrud
const { index, create, update, deleteItem: deleteServiceItem, errors, snackbarMessage, showSnackbar } = useCrud(props.route)
const showMassActions = ref(false)

// Sincronizar showMassActions com selectedItems
watch(selectedItems, (newValue) => {
  showMassActions.value = newValue.length > 0
})

// Carregar itens
const loadItems = async () => {
  const filterIndex = props.filter_index
  try {
    items.value = await index(filterIndex)
  } catch (err) {
    // Erros tratados pelo useCrud
  }
}

onMounted(() => {
  loadItems()
})

// Funções
const openAddModal = async () => {
  isEditing.value = false
  form.value = {}
  props.fields.forEach(field => {
    form.value[field.key] = field.defaultValue ?? null
  })
  dialog.value = true
  nextTick(() => formularioRef.value?.resetValidation())
}

const openEditModal = async (item) => {
  isEditing.value = true
  form.value = item
  if (props.onEdit) await props.onEdit(item)
  dialog.value = true
  nextTick(() => formularioRef.value?.resetValidation())
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
      console.log(err)
    }
  }
}
</script>