<template>
  <v-select
    v-bind="$attrs"
    v-model="modelValue"
    :items="sortedItems"
    :label="label"
    :rules="rules"
    :multiple="multiple"
    :required="required"
    :clearable="clearable"
    item-title="text"
    item-value="value"
    :return-object="false"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  rules: { type: Array, default: () => [] },
  multiple: Boolean,
  required: Boolean,
  clearable: { type: Boolean, default: true },
  emptyOption: { type: Object, default: null },
  sorted: { type: Boolean, default: false },
})

const modelValue = defineModel({ type: null, default: null })

const sortedItems = computed(() => {
  if (!props.sorted || !props.items) return props.items
  return [...props.items].sort((a, b) =>
    String(a.text ?? '').localeCompare(String(b.text ?? ''), undefined, { sensitivity: 'base' })
  )
})
</script>