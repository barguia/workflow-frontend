<template>
  <v-autocomplete
      v-bind="$attrs"
      v-model="modelValue"
      :items="sortedItems"
      :label="label"
      :rules="rules"
      :multiple="multiple"
      :required="required"
      :clearable="clearable"
      :no-filter="noFilter"
      item-title="text"
      item-value="value"
      :return-object="false"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  items: Array,
  rules: Array,
  multiple: Boolean,
  required: Boolean,
  clearable: { type: Boolean, default: true },
  noFilter: { type: Boolean, default: false },
  sorted: { type: Boolean, default: false },
})

const modelValue = defineModel()

const sortedItems = computed(() => {
  if (!props.sorted || !props.items) return props.items
  return [...props.items].sort((a, b) =>
    String(a.text ?? '').localeCompare(String(b.text ?? ''), undefined, { sensitivity: 'base' })
  )
})
</script>
