<template>
  <div>
    <v-label v-if="label">
      {{ label }}
    </v-label>
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
  label: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  rules: { type: Array, default: () => [] },
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

const modelValue = defineModel({ type: null, default: null })
</script>