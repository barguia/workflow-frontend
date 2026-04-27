<template>
  <v-text-field
      v-bind="$attrs"
      v-model="modelValue"
      type="email"
      :label="label"
      :rules="allRules"
      :required="required"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  rules: Array,
  required: Boolean,
})

const modelValue = defineModel()

const emailRule = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido'

const allRules = computed(() => [emailRule, ...(props.rules ?? [])])
</script>
