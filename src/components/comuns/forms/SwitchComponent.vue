<template>
  <v-switch
      v-bind="$attrs"
      v-model="modelValue"
      :true-value="trueValue"
      :false-value="falseValue"
      :rules="rules"
      :required="required"
      color="primary"
      hide-details="auto"
  >
    <template #label>
      <span>{{ label }}</span>
      <v-chip
          size="x-small"
          class="ml-2"
          :color="modelValue === trueValue ? 'success' : undefined"
          variant="tonal"
      >{{ modelValue === trueValue ? trueLabel : falseLabel }}</v-chip>
    </template>
  </v-switch>
</template>

<script setup>
defineProps({
  label: String,
  rules: Array,
  required: Boolean,
  trueLabel: { type: String, default: 'Sim' },
  falseLabel: { type: String, default: 'Não' },
  trueValue: { type: [Boolean, String, Number], default: true },
  falseValue: { type: [Boolean, String, Number], default: false },
})

const modelValue = defineModel()
</script>
