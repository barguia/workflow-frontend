<template>
  <div>
    <v-label v-if="label">{{ label }}</v-label>
    <v-checkbox
        v-for="item in sortedItems"
        :key="item.value"
        v-model="modelValue"
        :label="item.text"
        :value="item.value"
        :rules="rules"
        :inline="inline"
        :required="required"
        chips
        multiple
    />
  </div>
</template>
<script setup>
import { computed } from 'vue'

//       @update:modelValue="$emit('update:modelValue', $event)" chamada duplicada
const props = defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean,
  chips: Boolean,
  multiple: Boolean,
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