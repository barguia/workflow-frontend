<template>
  <v-btn v-bind="$attrs" :icon="!!icon || undefined">
    <v-icon v-if="typeof icon === 'string'">{{ icon }}</v-icon>
    <slot v-else-if="$slots.default" />
  </v-btn>
</template>

<script setup>
defineProps({
  icon: { type: [Boolean, String], default: undefined },
})
defineOptions({ inheritAttrs: false })
</script>
