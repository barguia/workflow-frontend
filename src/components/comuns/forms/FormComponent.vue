<template>
  <v-form ref="form" v-bind="$attrs">
    <slot/>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'

const form = ref(null) // Referência ao <v-form>

defineExpose({
  resetValidation: () => form.value.resetValidation(),
  reset: () => form.value.reset(),
  validate: () => form.value.validate()
})
</script>

<style scoped>

</style>

