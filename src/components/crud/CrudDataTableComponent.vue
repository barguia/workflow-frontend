<template>
  <v-data-table-server
      v-model="localSelected"
      :headers="localHeaders"
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
          v-model="localSearch"
          prepend-inner-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          density="compact"
          style="max-width: 280px"
          clearable
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
})

const emit = defineEmits(['update:selected', 'edit', 'update:options'])

const localHeaders = computed(() => props.headers)
const localItems = computed(() => props.items)
const localSearch = ref(props.search)

watch(() => props.search, (newVal) => {
  localSearch.value = newVal
})

watch(localSearch, (newVal) => {
  emit('update:search', newVal)
})

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
</style>
