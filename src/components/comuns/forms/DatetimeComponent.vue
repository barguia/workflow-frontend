<template>
  <v-text-field
    v-bind="$attrs"
    v-model="modelValue"
    type="datetime-local"
    :label="label"
    :rules="rules"
    :required="required"
  />
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  rules: { type: Array, default: () => [] },
  required: Boolean,
})

const modelValue = defineModel({ type: String, default: null })
</script>
