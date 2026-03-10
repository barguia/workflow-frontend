<template>
  <div>
    <v-label v-if="label">{{ label }}</v-label>
    <v-checkbox
        v-for="item in items"
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
//       @update:modelValue="$emit('update:modelValue', $event)" chamada duplicada
defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean,
  chips: Boolean,
  multiple: Boolean,
})

const modelValue = defineModel()
</script>