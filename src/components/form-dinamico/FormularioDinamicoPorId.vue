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
      @field-change="onFieldChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api.js'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import FormularioDinamico from '@/components/form-dinamico/FormularioDinamico.vue'
import { SNAPSHOT_VERSION_ATUAL } from '@/components/form-dinamico/snapshot-versoes/index.js'

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
const form     = ref({ ...(props.modelValue?.dados ?? {}) })

const tiposSelecionais = ['select', 'checkbox', 'radio', 'combobox', 'autocomplete']
// radio/checkbox renderizam todas as opções (grupo); select/autocomplete/combobox colapsam para o valor escolhido
const tiposComOpcoesCompletas = ['radio', 'checkbox']

// Estado auxiliar só para resolver os labels do snapshot — sem acúmulo histórico:
// - opcoesUriCompletas: último fetch de campos opcoes_por_uri do tipo "grupo completo" (radio/checkbox)
// - ultimoFetchOpcoes: último fetch de campos opcoes_por_uri do tipo "colapsa" (select/autocomplete/combobox), usado só para resolver o label no instante da seleção
// - opcaoSelecionadaAtual: label(s) capturados no momento em que o usuário selecionou (sobrescrito a cada mudança, não mesclado)
const opcoesUriCompletas   = ref({})
const ultimoFetchOpcoes    = ref({})
const opcaoSelecionadaAtual = ref({})

const opcoesEstaticas = (campo) =>
  (campo.campos_opcoes ?? [])
    .slice()
    .sort((a, b) =>
      Number(a.ordem) - Number(b.ordem) ||
      a.valor.localeCompare(b.valor) ||
      a.opcao.localeCompare(b.opcao)
    )
    .map(o => ({ value: o.valor, text: o.opcao }))

const onFieldChange = ({ field, value }) => {
  const campo = campos.value.find(c => c.campo === field.key)
  if (!campo || campo.opcoes_por_uri !== 1 || tiposComOpcoesCompletas.includes(campo.tipo)) return

  const disponiveis = ultimoFetchOpcoes.value[campo.campo] || []
  const valores = Array.isArray(value) ? value : [value]
  opcaoSelecionadaAtual.value[campo.campo] = disponiveis.filter(o => valores.includes(o.value))
}

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
          const opts = list.map(item => ({
            value: item[campo.opcoes_uri_value],
            text: item[campo.opcoes_uri_text],
          }))
          if (tiposComOpcoesCompletas.includes(campo.tipo)) {
            opcoesUriCompletas.value[campo.campo] = opts
          } else {
            ultimoFetchOpcoes.value[campo.campo] = opts
          }
          return opts
        }
        optionsLoader = () => fetchOptions()
        if (campo.tipo === 'autocomplete') {
          extraProps.noFilter = true
          extraProps.onSearch = fetchOptions
        }
      } else {
        const opcoes = opcoesEstaticas(campo)
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

const resolverOpcoesSnapshot = (campo) => {
  const valores = Array.isArray(form.value[campo.campo]) ? form.value[campo.campo] : [form.value[campo.campo]]

  if (tiposComOpcoesCompletas.includes(campo.tipo)) {
    const opcoes = campo.opcoes_por_uri === 1
      ? (opcoesUriCompletas.value[campo.campo] || [])
      : opcoesEstaticas(campo)
    return opcoes.map(o => ({ ...o, selected: valores.includes(o.value) }))
  }

  const opcoes = campo.opcoes_por_uri === 1
    ? (opcaoSelecionadaAtual.value[campo.campo] || [])
    : opcoesEstaticas(campo).filter(o => valores.includes(o.value))
  return opcoes.map(o => ({ ...o, selected: true }))
}

const snapshot = computed(() =>
  Object.fromEntries(campos.value.map(campo => [
    campo.campo,
    {
      id: campo.id,
      label: campo.label || campo.campo,
      type: campo.tipo,
      pivot: {
        cols: campo.pivot?.cols ?? 12,
      },
      ...(tiposSelecionais.includes(campo.tipo) && { campos_opcoes: resolverOpcoesSnapshot(campo) }),
      ...(campo.tipo === 'switch' && {
        trueLabel:  campo.pivot?.switch_true_label  || 'Sim',
        falseLabel: campo.pivot?.switch_false_label || 'Não',
        trueValue:  campo.pivot?.switch_true_value  ?? true,
        falseValue: campo.pivot?.switch_false_value ?? false,
      }),
    },
  ]))
)

watch([form, snapshot], () => {
  emit('update:modelValue', {
    snapshot_version: SNAPSHOT_VERSION_ATUAL,
    ctrl_formulario_id: props.formularioId,
    dados: form.value,
    snapshot: snapshot.value,
  })
}, { deep: true })

const carregarCampos = async (id) => {
  loading.value = true
  erro.value = false
  campos.value = []
  form.value = {}
  opcoesUriCompletas.value = {}
  ultimoFetchOpcoes.value = {}
  opcaoSelecionadaAtual.value = {}
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
