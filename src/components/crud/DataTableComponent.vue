<template>
  <v-data-table
      v-model="localSelected"
      :headers="localHeaders"
      :items="localItems"
      :items-per-page="10"
      :search="localSearch"
      show-select
      small
      class="elevation-1"
      item-key="id"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="localSearch"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
        ></v-text-field>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <slot name="actions" :item="item">
        <v-icon small class="mr-2" @click="$emit('edit', item)">
          mdi-pencil
        </v-icon>
      </slot>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  headers: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  title: { type: String, default: 'Lista de Itens' }
})

const emit = defineEmits(['update:selected', 'edit'])

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
</script>