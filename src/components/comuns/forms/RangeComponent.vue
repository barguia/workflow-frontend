<template>
  <v-slider
      v-bind="$attrs"
      v-model="modelValue"
      :label="label"
      :min="min"
      :max="max"
      :step="step"
      :rules="rules"
      :required="required"
      :thumb-label="thumbLabel"
      :show-ticks="showTicks"
      thumb-size="20"
      class="mt-2"
  />
</template>

<script setup>
defineProps({
  label: String,
  rules: Array,
  required: Boolean,
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  thumbLabel: { type: [Boolean, String], default: true },
  showTicks: { type: [Boolean, String], default: false },
})

const modelValue = defineModel()
</script>
