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
        v-for="item in items"
        :key="item.value"
        :label="item.text"
        :value="item.value"
    />
  </v-radio-group>
</template>

<script setup>
// @update:modelValue="$emit('update:modelValue', $event)" Chamada duplicada
defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean
})

const modelValue = defineModel()
</script>