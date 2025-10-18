<template>
  <v-data-table
      v-model="localSelected"
      :headers="localHeaders"
      :items="localItems"
      :items-per-page="10"
      :search="localSearch"
      show-select
      class="elevation-1"
      item-key="id"
      :hide-default-header="false"
  >
    <template v-slot:top>
      <ToolbarComponent flat>
        <ToolbarTitleComponent>{{ title }}</ToolbarTitleComponent>
        <v-spacer></v-spacer>
        <TextFieldComponent
          v-model="localSearch"
          append-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
        />
      </ToolbarComponent>
    </template>
    <template v-slot:item.actions="{ item }">
      <slot name="actions" :item="item">
        <IconComponent class="mr-2" @click="$emit('edit', item)">
          mdi-pencil
        </IconComponent>
      </slot>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import IconComponent from "@/components/comuns/icons/IconComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ToolbarTitleComponent from "@/components/comuns/navigations/ToolbarTitleComponent.vue";
import ToolbarComponent from "@/components/comuns/navigations/ToolbarComponent.vue";

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

<style scoped>
.v-data-table-header {
  display: table-header-group !important;
}
.v-data-table-header th {
  font-weight: bold;
}
</style>