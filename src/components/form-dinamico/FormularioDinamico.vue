<!-- src/components/forms/FormularioDinamico.vue -->
<template>
  <FormComponent ref="formRef" v-model="valid" lazy-validation>
    <!-- v-show = hidden, mas ainda no DOM -->
    <RowComponent>
      <ColComponent v-for="field in visibleFields" :key="field.key" v-show="resolveVisible(field)" :class="'v-col-'+(field.col ?? 12)">
        <!-- v-if = remove do DOM -->
        <template v-if="resolveRenderIf(field)">

          <!-- TEXT / EMAIL / DATE / PASSWORD -->
          <TextFieldComponent
              v-if="isType(field, ['text','email','date','password'])"
              v-model="localForm[field.key]"
              :label="field.label"
              :type="field.type || 'text'"
              :rules="resolveRules(field)"
              :error-messages="validationErrors[field.key]"
              :required="!field.optional"
              :disabled="resolveDisabled(field)"
              @update:modelValue="onFieldChange(field, $event)"
          />

          <!-- TEXTAREA -->
          <TextAreaComponent
              v-else-if="isType(field, 'textarea')"
              v-model="localForm[field.key]"
              :label="field.label"
              :rules="resolveRules(field)"
              :error-messages="validationErrors[field.key]"
              :required="!field.optional"
              :disabled="resolveDisabled(field)"
              @update:modelValue="onFieldChange(field, $event)"
          />

          <!-- SELECT -->
          <SelectComponent
              v-else-if="isType(field, 'select')"
              v-model="localForm[field.key]"
              :label="field.label"
              :items="fieldOptions[field.key] || []"
              :rules="resolveRules(field)"
              :multiple="field.multiple ?? false"
              :error-messages="validationErrors[field.key]"
              :required="!field.optional"
              :disabled="resolveDisabled(field)"
              @update:modelValue="onFieldChange(field, $event)"
          />

          <!-- RADIO -->
          <RadioComponent
              v-else-if="isType(field, 'radio')"
              v-model="localForm[field.key]"
              :label="field.label"
              :items="fieldOptions[field.key] || []"
              :rules="resolveRules(field)"
              :inline="field.inline ?? false"
              :error-messages="validationErrors[field.key]"
              :required="!field.optional"
              :disabled="resolveDisabled(field)"
              @update:modelValue="onFieldChange(field, $event)"
          />

          <!-- CHECKBOX -->
          <CheckboxComponent
              v-else-if="isType(field, 'checkbox')"
              v-model="localForm[field.key]"
              :label="field.label"
              :items="fieldOptions[field.key] || []"
              :rules="resolveRules(field)"
              :inline="field.inline ?? false"
              :error-messages="validationErrors[field.key]"
              :required="!field.optional"
              :disabled="resolveDisabled(field)"
              @update:modelValue="onFieldChange(field, $event)"
          />
        </template>
      </ColComponent>
    </RowComponent>
  </FormComponent>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { debounce, isEqual } from 'lodash-es'
import RadioComponent from "@/components/comuns/forms/RadioComponent.vue";
import CheckboxComponent from "@/components/comuns/forms/CheckboxComponent.vue";
import SelectComponent from "@/components/comuns/forms/SelectComponent.vue";
import TextAreaComponent from "@/components/comuns/forms/TextAreaComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";

const props = defineProps({
  fields: { type: Array, required: true },
  modelValue: { type: Object, required: true },
  validationErrors: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  context: { type: Object, default: () => ({}) },
})
const prevValues = ref({})
const emit = defineEmits(['update:modelValue', 'update:valid', 'field-change'])

const localForm   = ref({ ...props.modelValue })
const valid       = ref(true)
const formRef     = ref(null)
const fieldOptions = ref({})               // { campoKey: [opções] }

/* -------------------------------------------------
   1. CÁLCULO DE VISIBILIDADE
   ------------------------------------------------- */
const visibleFields = computed(() => {
  // Primeiro filtra campos que nunca devem aparecer (renderIf = false)
  return props.fields.filter(f => resolveRenderIf(f))
})

const resolveVisible = (field) => {
  if (field.visible === false) return false
  if (typeof field.visible === 'function') return field.visible(localForm.value, props.context)
  return true
}
const resolveRenderIf = (field) => {
  if (field.renderIf === false) return false
  if (typeof field.renderIf === 'function') return field.renderIf(localForm.value, props.context)
  return true
}

/* -------------------------------------------------
   2. RESOLUÇÃO DE PROPS DINÂMICAS
   ------------------------------------------------- */
const resolveDisabled = (field) => {
  if (typeof field.disabled === 'function') return field.disabled(localForm.value, props.context)
  return !!field.disabled
}

const resolveRules = (field) => {
  if (Array.isArray(field.rules)) return field.rules
  if (typeof field.rules === 'function') {
    return field.rules(localForm.value, props.context)
  }
  return []
}

/* -------------------------------------------------
   3. CARREGAMENTO DE OPÇÕES (backend)
   ------------------------------------------------- */
const loadOptions = async (triggerKey = null) => {
  // Se não há trigger, carrega apenas campos sem dependência (inicial)
  if (!triggerKey) {
    const rootFields = props.fields.filter(f =>
        typeof f.options === 'function' && !f.dependsOn
    )
    await loadFields(rootFields)
    return
  }

  // Se há trigger, carrega apenas campos que dependem dele
  const dependentFields = props.fields.filter(f =>
      typeof f.options === 'function' && f.dependsOn === triggerKey
  )
  await loadFields(dependentFields)
}

const loadFields = async (fields) => {
  const promises = fields.map(async (field) => {
    try {
      const opts = await field.options(localForm.value, props.context)
      fieldOptions.value[field.key] = Array.isArray(opts) ? opts : []
    } catch (e) {
      console.warn(`[FormularioDinamico] erro ao carregar ${field.key}`, e)
      fieldOptions.value[field.key] = []
    }
  })
  await Promise.all(promises)
}


/* -------------------------------------------------
   4. WATCHERS (evita loop infinito)
   ------------------------------------------------- */
watch(() => props.modelValue, (nv) => {
  if (isEqual(nv, localForm.value)) return

  localForm.value = { ...nv }
}, { deep: true })

watch(localForm, (nv) => {
  if (!isEqual(nv, props.modelValue)) {
    emit('update:modelValue', { ...nv })
  }
}, { deep: true, flush: 'sync' })

/* Recarrega opções sempre que o form mudar (ex: estado → cidade) */
// watch(localForm, loadOptions, { deep: true })

/* Carrega opções iniciais */
onMounted(loadOptions)

/* -------------------------------------------------
   5. EVENTOS
   ------------------------------------------------- */
const onFieldChange = async (field, value) => {
  const key = field.key
  const prev = prevValues.value[key]

  // 1. Sempre atualiza o form
  localForm.value[key] = value

  // 2. Emite field-change APENAS se o valor mudou
  if (!isEqual(prev, value)) {
    emit('field-change', { field, value, form: localForm.value })
    prevValues.value[key] = value // atualiza cache
  }

  // 3. Executa onChange
  if (typeof field.onChange === 'function') {
    await field.onChange({
      value,
      form: localForm.value,
      setField: (k, v) => {
        localForm.value[k] = v
        prevValues.value[k] = v // mantém cache atualizado
      },
      loadOptions,
      context: props.context,
    })
  }

  // 4. Recarrega dependentes
  loadOptions(key)
}

/* -------------------------------------------------
   6. UTILIDADES
   ------------------------------------------------- */
const isType = (field, types) => {
  const arr = Array.isArray(types) ? types : [types]
  return arr.includes(field.type || 'text')
}

/* -------------------------------------------------
   7. EXPOR
   ------------------------------------------------- */
const resetValidation = () => nextTick(() => formRef.value?.resetValidation?.())
defineExpose({ resetValidation, loadOptions })
</script>