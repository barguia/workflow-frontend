<template>
  <div>
    <v-label v-if="label">{{ label }}</v-label>
    <v-combobox
        v-model="modelValue"
        :items="items"
        :rules="rules"
        :inline="inline"
        :required="required"
        item-title="text"
        item-value="value"
        :chips="chips"
        :multiple="multiple"
        :clearable="clearable"
    />
  </div>
</template>
<script setup>

defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean,
  chips: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
})

const modelValue = defineModel()
</script>