<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <DataTableComponent
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
        </DataTableComponent>
      </v-container>

      <!-- Botão de Adicionar Novo Item -->
      <v-btn
          color="primary"
          fab
          dark
          fixed
          bottom
          right
          @click="openAddModal"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <!-- Botões de Ação em Massa (aparecem quando há seleção) -->
      <v-snackbar v-model="showMassActions" multi-line location="top" timeout="auto">
        <v-row>
          <v-col cols="auto">
            {{ selectedItems.length }} item(ns) selecionado(s)
          </v-col>
          <v-col cols="auto">
            <v-btn text color="error" @click="deleteSelected">
              Excluir Selecionados
            </v-btn>
          </v-col>
        </v-row>
      </v-snackbar>

      <!-- Modal para Adicionar/Editar Item -->
      <v-dialog v-model="dialog" max-width="600px" @keydown.esc="closeModal">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? 'Editar ' + title.toLowerCase() : 'Adicionar ' + title.toLowerCase() }}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="formRef" v-model="valid" lazy-validation>
              <v-text-field
                  v-for="field in fields"
                  :key="field.key"
                  v-model="form[field.key]"
                  :label="field.label"
                  :type="field.type || 'text'"
                  :rules="field.rules"
                  :required="!field.optional"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeModal">
              Cancelar
            </v-btn>
            <v-btn v-if="isEditing && hasResetPassword" color="warning" text @click="resetPassword">
              Resetar Senha
            </v-btn>
            <v-btn color="primary" text @click="saveItem" :disabled="!valid">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar para Erros/Sucesso -->
      <v-snackbar
          v-model="showSnackbar"
          :color="snackbarMessage === 'Operação realizada com sucesso!' ? 'success' : 'error'"
          timeout="3000"
      >
        {{ snackbarMessage }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="showSnackbar = false">
            Fechar
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useCrud } from '@/services/useCrud.js' // Ajuste o caminho conforme sua estrutura
import DataTableComponent from './DataTableComponent.vue'

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
const valid = ref(false)
const formRef = ref(null)
const form = ref({})

// useCrud
const { index, create, update, deleteItem: deleteServiceItem, errors, snackbarMessage, showSnackbar } = useCrud('app/users')
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
  if (!valid.value) return
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
    }
  }
}

const resetPassword = () => {
  // Implementar lógica específica de reset senha via API
  console.log('Resetando senha para:', form.value.id)
  // Exemplo: await someResetService(form.value.id)
}
</script>