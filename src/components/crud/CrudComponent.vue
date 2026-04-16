<template>
  <div>
    <ContainerComponent fluid>
      <CrudDataTableComponent
          v-bind="$attrs"
          v-model:selected="selectedItems"
          :headers="headers"
          :items="items"
          v-model:search="search"
          :title="title"
          :show-select="showSelect"
          :total-items="effectiveTotalItems"
          :page="currentPage"
          :items-per-page="perPage"
          :available-columns="activeAvailableColumns"
          :selected-columns="selectedColumns"
          @update:selected-columns="selectedColumns = $event"
          @edit="openEditModal"
          @update:options="handleTableOptions"
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
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useCrud } from '@/services/useCrud.js'
import { useValidationErrors } from '@/composables/useValidationErrors'
import { useColumnSelection } from '@/composables/useColumnSelection.js'

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
  searchable: { type: Boolean, default: false },
  onEdit: { type: Function, default: null },
})

const emit = defineEmits(['item-saved', 'item-deleted'])

const rawItems = ref([])
const selectedItems = ref([])
const search = ref('')
const dialog = ref(false)
const isEditing = ref(false)
const formularioRef = ref(null)
const form = ref({})
const resolvedOptions = ref({})
const { validationErrors, clearErrors } = useValidationErrors();

// Paginação e busca server-side
const currentPage = ref(1)
const perPage = ref(50)
const totalItems = ref(0)
const currentSortBy = ref([])

const filteredItems = computed(() => {
  if (!search.value) return rawItems.value
  const term = search.value.toLowerCase()
  return rawItems.value.filter(item =>
    Object.values(item).some(v => String(v ?? '').toLowerCase().includes(term))
  )
})

const getVal = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj) ?? ''

const items = computed(() => {
  const base = filteredItems.value
  if (!currentSortBy.value.length) return base
  const { key, order } = currentSortBy.value[0]
  return [...base].sort((a, b) => {
    const cmp = String(getVal(a, key)).localeCompare(String(getVal(b, key)), undefined, { numeric: true, sensitivity: 'base' })
    return order === 'desc' ? -cmp : cmp
  })
})

const effectiveTotalItems = computed(() => search.value ? filteredItems.value.length : totalItems.value)
let skipNextOptionsEvent = true

// Colunas da pesquisa
const availableColumns = ref([])
const selectedColumns = ref([])
const activeAvailableColumns = computed(() => props.searchable ? availableColumns.value : [])
const { initColumns, saveColumns } = useColumnSelection(props.route)

watch(selectedColumns, saveColumns)

// useCrud
const { index, fetchColumns, create, update, deleteItem: deleteServiceItem, errors, snackbarMessage, showSnackbar } = useCrud(props.route)
const showMassActions = ref(false)

// Sincronizar showMassActions com selectedItems
watch(selectedItems, (newValue) => {
  showMassActions.value = newValue.length > 0
})

// Carregar itens do backend (paginação server-side)
const loadItems = async () => {
  const params = {
    ...props.filter_index,
    page: currentPage.value,
    per_page: perPage.value === -1 ? 99999 : perPage.value,
  }
  try {
    const response = await index(params)
    if (response && !Array.isArray(response) && 'data' in response && 'total' in response) {
      rawItems.value = response.data
      totalItems.value = response.total
      currentPage.value = response.current_page
      perPage.value = response.per_page
    } else {
      rawItems.value = Array.isArray(response) ? response : []
      totalItems.value = rawItems.value.length
    }
  } catch (err) {
    // Erros tratados pelo useCrud
  }
}

// Reagir à mudança de página/per_page/sortBy vinda da tabela
const handleTableOptions = ({ page, itemsPerPage, sortBy }) => {
  if (skipNextOptionsEvent) {
    skipNextOptionsEvent = false
    return
  }
  const newSortBy = sortBy ?? []
  const sortChanged = JSON.stringify(newSortBy) !== JSON.stringify(currentSortBy.value)
  if (sortChanged) {
    currentSortBy.value = newSortBy
  }
  if (page !== currentPage.value || itemsPerPage !== perPage.value) {
    currentPage.value = page
    perPage.value = itemsPerPage
    loadItems()
  }
}

onMounted(async () => {
  loadItems()
  if (props.searchable) {
    const cols = await fetchColumns()
    availableColumns.value = [...cols, 'actions']
    selectedColumns.value  = initColumns(availableColumns.value)
  }
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
