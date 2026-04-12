<template>
  <v-data-table-server
      v-model="localSelected"
      :headers="effectiveHeaders"
      :items="localItems"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :page="page"
      :items-per-page-options="[
        { value: 50, title: '50' },
        { value: 100, title: '100' },
        { value: 200, title: '200' },
        { value: 500, title: '500' },
        { value: -1, title: 'Todos' },
      ]"
      :show-select="showSelect"
      class="elevation-0 rounded-lg"
      item-key="id"
      hover
      @update:options="handleOptionsUpdate"
  >
    <template v-slot:top>
      <div class="table-toolbar pa-4 d-flex align-center ga-3">
        <span class="text-subtitle-1 font-weight-semibold">{{ title }}</span>
        <SpacerComponent />
        <TextFieldComponent
          v-if="showSearch"
          v-model="localSearch"
          prepend-inner-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          density="compact"
          style="max-width: 280px"
          clearable
        />
        <v-btn
          v-if="availableColumns.length > 0"
          icon="mdi-table-column"
          variant="text"
          density="comfortable"
          :color="localSearch ? 'primary' : undefined"
          title="Selecionar colunas"
          @click="openColumnDialog"
        />
      </div>
    </template>
    <template v-slot:item.preview="{ item }">
      <slot name="preview" :item="item" />
    </template>
    <template v-slot:item.actions="{ item }">
      <slot name="actions" :item="item">
        <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="$emit('edit', item)" />
      </slot>
    </template>
  </v-data-table-server>

  <!-- Seletor de colunas -->
  <v-dialog v-model="columnDialog" max-width="380" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center py-3 px-4">
        <v-icon start size="18" color="primary">mdi-table-column</v-icon>
        <span class="text-subtitle-1 font-weight-semibold">Colunas visíveis</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="columnDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-2" style="max-height: 420px; overflow-y: auto">
        <div
          v-for="(col, i) in dialogColumns"
          :key="col.key"
          draggable="true"
          @dragstart="onDragStart(i)"
          @dragover.prevent="onDragOver(i)"
          @dragleave="dragOverIdx = null"
          @drop.prevent="onDrop(i)"
          :class="['d-flex align-center ga-1 px-2 py-1 rounded drag-row', { 'drag-over': dragOverIdx === i }]"
        >
          <v-icon size="18" class="drag-handle" color="on-surface">mdi-drag-vertical</v-icon>
          <v-checkbox
            v-model="col.visible"
            :label="formatColumnTitle(col.key)"
            hide-details
            density="compact"
            class="flex-grow-1"
          />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-3 ga-2">
        <v-btn variant="text" size="small" @click="selectAll">Todas</v-btn>
        <v-btn variant="text" size="small" @click="selectNone">Nenhuma</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="columnDialog = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="applyColumns">Aplicar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'

const props = defineProps({
  headers: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  title: { type: String, default: 'Lista de Itens' },
  showSelect: { type: Boolean, default: true },
  totalItems: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 50 },
  availableColumns: { type: Array, default: () => [] },
  selectedColumns: { type: Array, default: () => [] },
  showSearch: { type: Boolean, default: true },
})

const emit = defineEmits(['update:selected', 'edit', 'update:options', 'update:search', 'update:selectedColumns'])

const localHeaders = computed(() => props.headers)
const localItems = computed(() => props.items)
const localSearch = ref(props.search)

// Headers efetivos: usa colunas selecionadas quando fornecidas, senão os headers padrão
const effectiveHeaders = computed(() => {
  if (props.availableColumns.length === 0 || props.selectedColumns.length === 0) return localHeaders.value
  return props.selectedColumns.map(key => {
    if (key === 'actions') return { key, title: 'Ações', sortable: false, align: 'end' }
    return { key, title: formatColumnTitle(key), sortable: true }
  })
})

const formatColumnTitle = (key) => {
  if (key === 'actions') return 'Ações'
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Seletor de colunas
const columnDialog = ref(false)
const dialogColumns = ref([])
let draggedIdx = null
const dragOverIdx = ref(null)

const openColumnDialog = () => {
  const selectedSet = new Set(props.selectedColumns)
  dialogColumns.value = [
    ...props.selectedColumns.map(key => ({ key, visible: true })),
    ...props.availableColumns
      .filter(key => !selectedSet.has(key))
      .map(key => ({ key, visible: false })),
  ]
  columnDialog.value = true
}

const onDragStart = (i) => { draggedIdx = i }
const onDragOver = (i) => { dragOverIdx.value = i }
const onDrop = (i) => {
  if (draggedIdx === null || draggedIdx === i) { draggedIdx = null; dragOverIdx.value = null; return }
  const arr = [...dialogColumns.value]
  const [item] = arr.splice(draggedIdx, 1)
  arr.splice(i, 0, item)
  dialogColumns.value = arr
  draggedIdx = null
  dragOverIdx.value = null
}

const selectAll = () => dialogColumns.value.forEach(c => c.visible = true)
const selectNone = () => dialogColumns.value.forEach(c => c.visible = false)

const applyColumns = () => {
  const selected = dialogColumns.value.filter(c => c.visible).map(c => c.key)
  emit('update:selectedColumns', selected)
  columnDialog.value = false
}

watch(() => props.search, (newVal) => { localSearch.value = newVal })
watch(localSearch, (newVal) => { emit('update:search', newVal) })

const localSelected = computed({
  get: () => props.selected,
  set: (val) => emit('update:selected', val)
})

const handleOptionsUpdate = (opts) => {
  emit('update:options', opts)
}
</script>

<style scoped>
.table-toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

:deep(.v-data-table-header__content) {
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.drag-handle {
  opacity: 0.4;
  cursor: grab;
}

.drag-row {
  transition: background 0.1s;
}

.drag-row.drag-over {
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
