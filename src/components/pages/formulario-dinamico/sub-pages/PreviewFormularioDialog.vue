<template>
  <DialogComponent v-model="dialog" max-width="700" scrollable>
    <CardComponent>
      <CardTitleComponent class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ titulo }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
      </CardTitleComponent>

      <v-divider />

      <CardTextComponent class="pa-4">
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-alert v-else-if="erro" type="error" variant="tonal" class="mb-4">
          Não foi possível carregar os campos do formulário.
        </v-alert>

        <v-alert v-else-if="!loading && campos.length === 0" type="info" variant="tonal">
          Este formulário não possui campos associados.
        </v-alert>

        <FormularioDinamico
            v-else
            ref="formRef"
            :fields="fields"
            v-model="form"
            :validation-errors="{}"
        />
      </CardTextComponent>

      <v-divider />

      <CardActionsComponent class="pa-3">
        <v-spacer />
        <ButtonComponent variant="text" @click="dialog = false">Fechar</ButtonComponent>
        <ButtonComponent v-if="campos.length" color="primary" @click="validar">Validar</ButtonComponent>
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

const fields = computed(() =>
  campos.value.map(campo => ({
    key: String(campo.id),
    label: campo.label || campo.campo,
    type: campo.tipo,
    mask: campo.mascara || undefined,
    placeholder: campo.placeholder || '',
    optional: !campo.obrigatorio,
    rules: campo.obrigatorio
      ? [v => !!v || `${campo.label || campo.campo} é obrigatório`]
      : [],
  }))
)

const carregarCampos = async (id) => {
  loading.value = true
  erro.value = false
  campos.value = []
  form.value = {}
  try {
    const res = await api.get(`wf/forms/formularios-campos/${id}`)
    campos.value = res.data.data ?? []
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
