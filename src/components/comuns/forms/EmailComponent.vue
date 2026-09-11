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
  label: { type: String, default: '' },
  rules: { type: Array, default: () => [] },
  required: Boolean,
})

const modelValue = defineModel({ type: String, default: null })

const emailRule = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido'

const allRules = computed(() => [emailRule, ...(props.rules ?? [])])
</script>
