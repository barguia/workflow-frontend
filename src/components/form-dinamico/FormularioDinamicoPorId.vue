<!-- src/components/form-dinamico/FormularioDinamicoPorId.vue -->
<template>
  <div>
    <ProgressLinearComponent
      v-if="loading"
      indeterminate
      color="primary"
    />

    <AlerComponent
      v-else-if="erro"
      type="error"
      variant="tonal"
    >
      Não foi possível carregar os campos do formulário.
    </AlerComponent>

    <AlerComponent
      v-else-if="campos.length === 0"
      type="info"
      variant="tonal"
    >
      Este formulário não possui campos associados.
    </AlerComponent>

    <FormularioDinamico
      v-else
      ref="formRef"
      v-model="form"
      :fields="fields"
      :validation-errors="validationErrors"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api.js'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import FormularioDinamico from '@/components/form-dinamico/FormularioDinamico.vue'

const props = defineProps({
  formularioId: { type: [Number, String], default: null },
  modelValue: { type: Object, default: () => ({}) },
  validationErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'carregado'])

const campos   = ref([])
const loading  = ref(false)
const erro     = ref(false)
const formRef  = ref(null)
const form     = ref({ ...props.modelValue })

watch(form, val => emit('update:modelValue', val), { deep: true })

const tiposSelecionais = ['select', 'checkbox', 'radio', 'combobox', 'autocomplete']

const fields = computed(() =>
  campos.value.map(campo => {
    let optionsLoader = undefined
    const extraProps = {}

    if (tiposSelecionais.includes(campo.tipo)) {
      if (campo.opcoes_por_uri === 1) {
        const fetchOptions = async (search = '') => {
          const params = search ? { [campo.opcoes_uri_text]: search } : {}
          const res = await api.get(campo.opcoes_uri, { params })
          const list = Array.isArray(res.data?.data) ? res.data.data : []
          return list.map(item => ({
            value: item[campo.opcoes_uri_value],
            text: item[campo.opcoes_uri_text],
          }))
        }
        optionsLoader = () => fetchOptions()
        if (campo.tipo === 'autocomplete') {
          extraProps.noFilter = true
          extraProps.onSearch = fetchOptions
        }
      } else {
        const opcoes = (campo.campos_opcoes ?? [])
          .slice()
          .sort((a, b) =>
            Number(a.ordem) - Number(b.ordem) ||
            a.valor.localeCompare(b.valor) ||
            a.opcao.localeCompare(b.opcao)
          )
          .map(o => ({ value: o.valor, text: o.opcao }))
        optionsLoader = async () => opcoes
      }
    }

    if (campo.tipo === 'range') {
      extraProps.min  = campo.pivot?.range_minimo  ?? 0
      extraProps.max  = campo.pivot?.range_maximo  ?? 100
      extraProps.step = campo.pivot?.range_step     ?? 1
    }

    if (campo.tipo === 'switch') {
      extraProps.trueLabel  = campo.pivot?.switch_true_label  || 'Sim'
      extraProps.falseLabel = campo.pivot?.switch_false_label || 'Não'
      extraProps.trueValue  = campo.pivot?.switch_true_value  ?? true
      extraProps.falseValue = campo.pivot?.switch_false_value ?? false
    }

    return {
      key: campo.campo,
      label: campo.label || campo.campo,
      type: campo.tipo,
      col: campo.pivot?.cols ?? 12,
      mask: campo.mascara || undefined,
      placeholder: campo.placeholder || '',
      optional: !campo.pivot?.obrigatorio,
      rules: campo.pivot?.obrigatorio
        ? [v => (v !== null && v !== undefined && v !== '') || `${campo.label || campo.campo} é obrigatório`]
        : [],
      ...(optionsLoader && {
        options: optionsLoader,
        multiple: campo.tipo === 'select' ? campo.pivot?.select_multiplo === 1 : false,
      }),
      ...extraProps,
    }
  })
)

const carregarCampos = async (id) => {
  loading.value = true
  erro.value = false
  campos.value = []
  form.value = {}
  try {
    const res = await api.get(`wf/forms/formularios-campos/${id}`)
    campos.value = (res.data.data ?? []).slice().sort((a, b) => (a.pivot?.ordem ?? 0) - (b.pivot?.ordem ?? 0))
    form.value = Object.fromEntries(
      campos.value.map(campo => {
        const raw = campo.pivot?.valor_default ?? null
        let val = raw
        if (raw !== null && raw !== '' && campo.opcoes_por_uri === 1) {
          const n = Number(raw)
          if (Number.isFinite(n)) val = n
        }
        if (campo.tipo === 'switch' && val === null) val = campo.pivot?.switch_false_value ?? false
        if (campo.tipo === 'range' && val === null) val = campo.pivot?.range_minimo ?? 0
        if (campo.tipo === 'checkbox' || (campo.tipo === 'select' && campo.pivot?.select_multiplo === 1)) {
          if (!val) {
            val = []
          } else if (typeof val === 'string') {
            try { val = JSON.parse(val) } catch { val = val.split(',').map(s => s.trim()).filter(Boolean) }
          }
        }
        return [campo.campo, val]
      })
    )
    emit('carregado', campos.value)
  } catch {
    erro.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.formularioId, (id) => {
  if (!id) {
    campos.value = []
    form.value = {}
    return
  }
  carregarCampos(id)
}, { immediate: true })

const validate = () => formRef.value?.validate?.()

defineExpose({ validate, campos, loading, erro })
</script>
