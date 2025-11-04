<!-- src/components/forms/FormularioDinamico.vue -->
<template>
  <FormComponent ref="formRef" v-model="valid" lazy-validation>
    <template v-for="field in fields" :key="field.key">
      <!-- Text, Email, Date, Password -->
      <TextFieldComponent
          v-if="['text', 'email', 'date', 'password'].includes(field.type || 'text')"
          v-model="localForm[field.key]"
          :label="field.label"
          :type="field.type || 'text'"
          :rules="field.rules"
          :error-messages="validationErrors[field.key]"
          :required="!field.optional"
      />

      <!-- Textarea -->
      <TextAreaComponent
          v-else-if="field.type === 'textarea'"
          v-model="localForm[field.key]"
          :label="field.label"
          :rules="field.rules"
          :error-messages="validationErrors[field.key]"
          :required="!field.optional"
      />

      <!-- Select -->
      <SelectComponent
          v-else-if="field.type === 'select'"
          v-model="localForm[field.key]"
          :label="field.label"
          :items="resolvedOptions[field.key] || []"
          :rules="field.rules"
          :multiple="field.multiple || false"
          :error-messages="validationErrors[field.key]"
          :required="!field.optional"
      />

      <!-- Radio -->
      <RadioComponent
          v-else-if="field.type === 'radio'"
          v-model="localForm[field.key]"
          :label="field.label"
          :items="resolvedOptions[field.key] || []"
          :rules="field.rules"
          :inline="field.inline || false"
          :error-messages="validationErrors[field.key]"
          :required="!field.optional"
      />

      <!-- Checkbox -->
      <CheckboxComponent
          v-else-if="field.type === 'checkbox'"
          v-model="localForm[field.key]"
          :label="field.label"
          :items="resolvedOptions[field.key] || []"
          :rules="field.rules"
          :inline="field.inline || false"
          :error-messages="validationErrors[field.key]"
          :required="!field.optional"
      />
    </template>
  </FormComponent>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import FormComponent from "@/components/comuns/forms/FormComponent.vue"
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue"
import TextAreaComponent from "@/components/comuns/forms/TextAreaComponent.vue"
import SelectComponent from "@/components/comuns/forms/SelectComponent.vue"
import RadioComponent from "@/components/comuns/forms/RadioComponent.vue"
import CheckboxComponent from "@/components/comuns/forms/CheckboxComponent.vue"

const props = defineProps({
  fields: { type: Array, required: true },
  modelValue: { type: Object, required: true },
  validationErrors: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  resolvedOptions: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'update:valid'])

const localForm = ref({ ...props.modelValue })
const valid = ref(true)
const formRef = ref(null)

// Função auxiliar para comparar objetos profundamente
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// 1. props.modelValue → localForm (entrada)
watch(
    () => props.modelValue,
    (newVal) => {
      if (!isEqual(newVal, localForm.value)) {
        localForm.value = { ...newVal }
      }
    },
    { deep: true }
)

// 2. localForm → emit (saída)
watch(
    localForm,
    (newVal) => {
      if (!isEqual(newVal, props.modelValue)) {
        emit('update:modelValue', { ...newVal })
      }
    },
    { deep: true }
)

// Reset validation
const resetValidation = () => {
  nextTick(() => {
    formRef.value?.resetValidation?.()
  })
}

defineExpose({ resetValidation })
</script>