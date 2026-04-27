<template>
  <DialogComponent v-model="dialog" max-width="700" scrollable>
    <CardComponent>
      <CardTitleComponent class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ titulo }}</span>
        <ButtonComponent icon="mdi-close" variant="text" size="small" data-testid="preview-fechar-topo" @click="dialog = false" />
      </CardTitleComponent>

      <DividerComponent />

      <CardTextComponent class="pa-4">
        <ProgressLinearComponent v-if="loading" indeterminate color="primary" class="mb-4" />

        <AlerComponent v-else-if="erro" type="error" variant="tonal" class="mb-4">
          Não foi possível carregar os campos do formulário.
        </AlerComponent>

        <AlerComponent v-else-if="!loading && campos.length === 0" type="info" variant="tonal">
          Este formulário não possui campos associados.
        </AlerComponent>

        <FormularioDinamico
            v-else
            ref="formRef"
            :fields="fields"
            v-model="form"
            :validation-errors="{}"
        />
      </CardTextComponent>

      <DividerComponent />

      <CardActionsComponent class="pa-3">
        <SpacerComponent />
        <ButtonComponent variant="text" data-testid="preview-fechar" @click="dialog = false">Fechar</ButtonComponent>
        <ButtonComponent v-if="campos.length" color="primary" data-testid="preview-validar" @click="validar">Validar</ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api.js'
import DialogComponent from '@/components/comuns/dialogs/DialogComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import FormularioDinamico from '@/components/form-dinamico/FormularioDinamico.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  formulario: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(props.modelValue)
const campos = ref([])
const loading = ref(false)
const erro = ref(false)
const titulo = ref('')
const formRef = ref(null)
const form = ref({})

watch(() => props.modelValue, (v) => { dialog.value = v })
watch(dialog, (v) => emit('update:modelValue', v))

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
      key: String(campo.id),
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
        return [String(campo.id), val]
      })
    )
  } catch {
    erro.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.formulario, async (formulario) => {
  if (!formulario) return
  titulo.value = `Preview: ${formulario.formulario}`
  await carregarCampos(formulario.id)
}, { immediate: true })

const validar = () => formRef.value?.validate?.()
</script>
