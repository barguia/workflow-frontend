<template>
  <v-text-field
      v-bind="$attrs"
      v-model="modelValue"
      type="time"
      :label="label"
      :rules="rules"
      :required="required"
  />
</template>

<script setup>
defineProps({
  label: String,
  rules: Array,
  required: Boolean,
})

const modelValue = defineModel()
</script>
