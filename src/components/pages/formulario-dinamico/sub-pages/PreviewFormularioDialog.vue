<template>
  <v-dialog v-model="dialog" max-width="700" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ titulo }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-alert v-else-if="erro" type="error" variant="tonal" class="mb-4">
          Não foi possível carregar os campos do formulário.
        </v-alert>

        <v-alert v-else-if="!loading && campos.length === 0" type="info" variant="tonal">
          Este formulário não possui campos associados.
        </v-alert>

        <template v-else>
          <v-form ref="formRef">
            <v-row dense>
              <v-col v-for="campo in campos" :key="campo.id" cols="12">
                <v-text-field
                    v-if="isType(campo, ['text', 'email', 'date', 'password', 'number'])"
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :placeholder="campo.placeholder || ''"
                    :type="campo.tipo"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    persistent-hint
                />
                <v-textarea
                    v-else-if="isType(campo, 'textarea')"
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :placeholder="campo.placeholder || ''"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    persistent-hint
                />
                <v-select
                    v-else-if="isType(campo, 'select')"
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :placeholder="campo.placeholder || ''"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    :items="[]"
                    persistent-hint
                />
                <v-radio-group
                    v-else-if="isType(campo, 'radio')"
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    persistent-hint
                />
                <v-checkbox
                    v-else-if="isType(campo, 'checkbox')"
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    persistent-hint
                />
                <v-text-field
                    v-else
                    v-model="form[campo.id]"
                    :label="campo.label || campo.campo"
                    :placeholder="campo.placeholder || ''"
                    :hint="campo.descricao || ''"
                    :rules="campo.obrigatorio ? [v => !!v || `${campo.label || campo.campo} é obrigatório`] : []"
                    persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-3">
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Fechar</v-btn>
        <v-btn v-if="campos.length" color="primary" @click="validar">Validar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/services/api.js'

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

const isType = (campo, tipos) => {
  const arr = Array.isArray(tipos) ? tipos : [tipos]
  return arr.includes(campo.tipo)
}

const validar = async () => {
  await formRef.value?.validate()
}
</script>
