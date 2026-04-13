<template>
  <v-data-table-server
      v-bind="$attrs"
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
          title="Selecionar colunas"
          data-testid="column-selector-btn"
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
  <v-dialog v-model="columnDialog" max-width="520" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center py-3 px-4">
        <v-icon start size="18" color="primary">mdi-table-column</v-icon>
        <span class="text-subtitle-1 font-weight-semibold">Gerenciar colunas</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="columnDialog = false" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4" style="max-height: 520px; overflow-y: auto">

        <!-- Visíveis -->
        <div class="text-caption font-weight-bold text-uppercase mb-2 text-medium-emphasis">
          Visíveis ({{ visibleCols.length }})
        </div>
        <div
          v-for="(col, i) in visibleCols"
          :key="col.key"
          :draggable="dragIdx === i"
          @dragstart="onDragStart(i)"
          @dragover.prevent="onDragOver(i)"
          @dragleave="dragOverIdx = null"
          @drop.prevent="onDrop(i)"
          @dragend="dragIdx = null; dragOverIdx = null"
          :class="['col-row d-flex align-center ga-2 px-2 py-1 rounded mb-1', { 'drag-over': dragOverIdx === i }]"
        >
          <v-icon
            size="18"
            class="drag-handle"
            @mousedown="dragIdx = i"
            @mouseup="dragIdx = null"
          >mdi-drag-vertical</v-icon>
          <span class="flex-grow-1 text-body-2">{{ formatColumnTitle(col.key) }}</span>
          <v-btn
            icon="mdi-eye-off-outline"
            size="x-small"
            variant="text"
            density="compact"
            color="error"
            title="Ocultar coluna"
            @click="hideCol(i)"
          />
        </div>

        <v-divider v-if="hiddenCols.length > 0" class="my-4" />

        <!-- Ocultas -->
        <div v-if="hiddenCols.length > 0">
          <div class="text-caption font-weight-bold text-uppercase mb-2 text-medium-emphasis">
            Ocultas ({{ hiddenCols.length }})
          </div>
          <div
            v-for="(col, i) in hiddenCols"
            :key="col.key"
            class="col-row d-flex align-center ga-2 px-2 py-1 rounded mb-1"
          >
            <v-icon size="16" color="on-surface" style="opacity:.35">mdi-drag-vertical</v-icon>
            <span class="flex-grow-1 text-body-2 text-medium-emphasis">{{ formatColumnTitle(col.key) }}</span>
            <v-btn
              icon="mdi-eye-outline"
              size="x-small"
              variant="text"
              density="compact"
              color="primary"
              title="Mostrar coluna"
              @click="showCol(i)"
            />
          </div>
        </div>

      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-3 ga-2">
        <v-btn variant="text" size="small" @click="showAll">Todas</v-btn>
        <v-btn variant="text" size="small" @click="hideAll">Nenhuma</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="columnDialog = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="applyColumns">Aplicar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

defineOptions({ inheritAttrs: false })
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

const effectiveHeaders = computed(() => {
  if (props.availableColumns.length === 0) return localHeaders.value
  const cols = props.selectedColumns.length > 0 ? props.selectedColumns : props.availableColumns
  return cols.map(key => {
    if (key === 'actions') return { key, title: 'Ações', sortable: false, align: 'end' }
    return { key, title: formatColumnTitle(key), sortable: true }
  })
})

const formatColumnTitle = (key) => {
  if (key === 'actions') return 'Ações'
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Seletor de colunas — duas listas separadas (visíveis / ocultas)
const columnDialog = ref(false)
const visibleCols  = ref([])
const hiddenCols   = ref([])
const dragIdx      = ref(null)
const dragOverIdx  = ref(null)

const openColumnDialog = () => {
  const selectedSet = new Set(props.selectedColumns)
  visibleCols.value = props.selectedColumns.map(key => ({ key }))
  hiddenCols.value  = props.availableColumns
    .filter(key => !selectedSet.has(key))
    .map(key => ({ key }))
  columnDialog.value = true
}

// Drag-and-drop apenas na lista de visíveis
const onDragStart = (i) => { dragIdx.value = i }
const onDragOver  = (i) => { dragOverIdx.value = i }
const onDrop = (i) => {
  if (dragIdx.value === null || dragIdx.value === i) return
  const arr = [...visibleCols.value]
  const [item] = arr.splice(dragIdx.value, 1)
  arr.splice(i, 0, item)
  visibleCols.value = arr
}

const hideCol = (i) => {
  const arr = [...visibleCols.value]
  const [col] = arr.splice(i, 1)
  visibleCols.value = arr
  hiddenCols.value  = [...hiddenCols.value, col]
}

const showCol = (i) => {
  const arr = [...hiddenCols.value]
  const [col] = arr.splice(i, 1)
  hiddenCols.value  = arr
  visibleCols.value = [...visibleCols.value, col]
}

const showAll = () => {
  visibleCols.value = [...visibleCols.value, ...hiddenCols.value]
  hiddenCols.value  = []
}

const hideAll = () => {
  hiddenCols.value  = [...hiddenCols.value, ...visibleCols.value]
  visibleCols.value = []
}

const applyColumns = () => {
  emit('update:selectedColumns', visibleCols.value.map(c => c.key))
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

.col-row {
  transition: background 0.1s;
}

.col-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.drag-handle {
  opacity: 0.4;
  cursor: grab;
}

.drag-over {
  background: rgba(var(--v-theme-primary), 0.08);
  outline: 1px dashed rgba(var(--v-theme-primary), 0.4);
}
</style>
