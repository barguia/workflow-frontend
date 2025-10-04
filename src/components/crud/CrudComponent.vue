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
          <TextFieldComponent
              v-for="field in fields"
              :key="field.key"
              v-model="form[field.key]"
              :label="field.label"
              :type="field.type || 'text'"
              :rules="field.rules"
              :required="!field.optional"
          />
        </FormComponent>
      </CardTextComponent>
      <CardActionsComponent>
        <v-spacer></v-spacer>
        <ButtonComponent color="blue darken-1" text @click="closeModal">
          Cancelar
        </ButtonComponent>
        <ButtonComponent v-if="isEditing && hasResetPassword" color="warning" text @click="resetPassword">
          Resetar Senha
        </ButtonComponent>
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useCrud } from '@/services/useCrud.js'
import { useValidationErrors } from '@/composables/useValidationErrors';

import CrudDataTableComponent from './CrudDataTableComponent.vue'
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import SnackbarComponent from "@/components/comuns/alerts/SnackbarComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import CardActionsComponent from "@/components/comuns/cards/CardActionsComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";

const props = defineProps({
  route: { type: String, required: true }, // e.g., 'users'
  title: { type: String, required: true },
  fields: {
    type: Array,
    required: true,
    default: () => [] // [{ key: 'name', label: 'Nome', type: 'text', rules: [...], optional: false }]
  },
  headers: { type: Array, required: true }, // Headers para a tabela
  hasResetPassword: { type: Boolean, default: false } // Se deve mostrar botão de reset senha
})

const emit = defineEmits(['item-saved', 'item-deleted'])

const items = ref([])
const selectedItems = ref([])
const search = ref('')
const dialog = ref(false)
const isEditing = ref(false)

const formRef = ref(null)
const form = ref({})
const { validationErrors } = useValidationErrors();

// useCrud
const { index, create, update, deleteItem: deleteServiceItem, errors, snackbarMessage, showSnackbar } = useCrud(props.route)
const showMassActions = computed(() => selectedItems.value.length > 0)

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

// Funções
const openAddModal = () => {
  isEditing.value = false
  form.value = {}
  props.fields.forEach(field => {
    form.value[field.key] = ''
  })
  dialog.value = true
  nextTick(() => formRef.value?.resetValidation())
}

const openEditModal = (item) => {
  isEditing.value = true
  form.value = { ...item } // Cópia profunda para garantir carregamento correto dos dados
  dialog.value = true
  nextTick(() => formRef.value?.resetValidation())
}

const closeModal = () => {
  dialog.value = false
  form.value = {}
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
    console.log(err)
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

const resetPassword = () => {
  // Implementar lógica específica de reset senha via API
  console.log('Resetando senha para:', form.value.id)
  // Exemplo: await someResetService(form.value.id)
}
</script>