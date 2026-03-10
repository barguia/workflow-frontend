<template>
  <v-select
      v-bind="$attrs"
      v-model="modelValue"
      :items="items"
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
defineProps({
  label: String,
  items: Array,
  rules: Array,
  multiple: Boolean,
  required: Boolean,
  clearable: { type: Boolean, default: true },
  emptyOption: { type: Object, default: null }
})

const modelValue = defineModel()
</script>