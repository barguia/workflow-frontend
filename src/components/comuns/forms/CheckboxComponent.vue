<template>
  <div class="checkbox-group">
    <v-label v-if="label" class="checkbox-group__label">{{ label }}</v-label>
    <div :class="inline ? 'checkbox-group__inline' : 'checkbox-group__column'">
      <v-checkbox
          v-for="item in sortedItems"
          :key="item.value"
          v-model="modelValue"
          :label="item.text"
          :value="item.value"
          :rules="rules"
          :inline="inline"
          :required="required"
          density="compact"
          hide-details="auto"
          chips
          multiple
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

//       @update:modelValue="$emit('update:modelValue', $event)" chamada duplicada
const props = defineProps({
  label: String,
  items: Array,
  rules: Array,
  inline: Boolean,
  required: Boolean,
  chips: Boolean,
  multiple: Boolean,
  sorted: { type: Boolean, default: false },
})

const modelValue = defineModel()

const sortedItems = computed(() => {
  if (!props.sorted || !props.items) return props.items
  return [...props.items].sort((a, b) =>
    String(a.text ?? '').localeCompare(String(b.text ?? ''), undefined, { sensitivity: 'base' })
  )
})
</script>

<style scoped>
.checkbox-group__label {
  display: block;
  margin-bottom: 2px;
  font-size: 0.75rem;
  opacity: var(--v-medium-emphasis-opacity);
}
.checkbox-group__column {
  display: flex;
  flex-direction: column;
}
.checkbox-group__column :deep(.v-input) {
  --v-input-padding-top: 0px;
}
.checkbox-group__inline {
  display: flex;
  flex-wrap: wrap;
  column-gap: 16px;
}
</style>