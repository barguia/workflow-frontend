<template>
  <v-radio-group
      v-bind="$attrs"
      v-model="modelValue"
      :label="label"
      :rules="rules"
      :inline="inline"
      :required="required"
  >
    <v-radio
        v-for="item in sortedItems"
        :key="item.value"
        :label="item.text"
        :value="item.value"
    />
  </v-radio-group>
</template>

<script setup>
import { computed } from 'vue'

// @update:modelValue="$emit('update:modelValue', $event)" Chamada duplicada
const props = defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean,
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