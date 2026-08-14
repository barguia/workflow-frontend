<template>
  <DialogComponent
    v-model="dialog"
    max-width="1400"
    scrollable
  >
    <CardComponent>
      <CardTitleComponent class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ titulo }}</span>
        <ButtonComponent
          icon="mdi-close"
          variant="text"
          size="small"
          data-testid="preview-fechar-topo"
          @click="dialog = false"
        />
      </CardTitleComponent>

      <DividerComponent />

      <CardTextComponent class="pa-4">
        <FormularioDinamicoPorId
          v-show="modo === 'editar'"
          ref="formularioRef"
          v-model="dadosForm"
          :formulario-id="formulario?.id"
        />

        <FormularioDinamicoSnapshot
          v-if="modo === 'readonly'"
          :snapshot="dadosForm.snapshot"
          :snapshot-version="dadosForm.snapshot_version"
        />

        <template v-if="mostrarDados">
          <DividerComponent class="my-4" />
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-caption text-medium-emphasis">
              Dados do Formulário (debug)
            </div>
            <ButtonComponent
              icon="mdi-content-copy"
              variant="text"
              size="small"
              data-testid="preview-copiar-dados"
              @click="copiarDados"
            />
          </div>
          <pre>{{ dadosForm }}</pre>
        </template>
      </CardTextComponent>

      <DividerComponent />

      <CardActionsComponent class="pa-3">
        <ButtonComponent
          v-if="formularioRef?.campos?.length"
          variant="text"
          color="secondary"
          data-testid="preview-toggle-visualizacao"
          @click="modo = modo === 'editar' ? 'readonly' : 'editar'"
        >
          <IconComponent start>
            {{ modo === 'editar' ? 'mdi-eye-outline' : 'mdi-pencil-outline' }}
          </IconComponent>
          {{ modo === 'editar' ? 'Visualizar preenchido' : 'Editar' }}
        </ButtonComponent>
        <ButtonComponent
          v-if="formularioRef?.campos?.length"
          variant="text"
          color="secondary"
          data-testid="preview-ver-dados"
          @click="mostrarDados = !mostrarDados"
        >
          <IconComponent start>
            mdi-code-json
          </IconComponent>
          {{ mostrarDados ? 'Ocultar dados' : 'Ver dados' }}
        </ButtonComponent>
        <SpacerComponent />
        <ButtonComponent
          variant="text"
          data-testid="preview-fechar"
          @click="dialog = false"
        >
          Fechar
        </ButtonComponent>
        <ButtonComponent
          v-if="formularioRef?.campos?.length && modo === 'editar'"
          color="primary"
          data-testid="preview-validar"
          @click="validar"
        >
          Validar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>
</template>

<script setup>
import { ref, watch } from 'vue'
import DialogComponent from '@/components/comuns/dialogs/DialogComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import FormularioDinamicoPorId from '@/components/form-dinamico/FormularioDinamicoPorId.vue'
import FormularioDinamicoSnapshot from '@/components/form-dinamico/FormularioDinamicoSnapshot.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  formulario: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(props.modelValue)
const titulo = ref('')
const formularioRef = ref(null)
const dadosForm = ref({})
const mostrarDados = ref(false)
const modo = ref('editar') // 'editar' | 'readonly'

watch(() => props.modelValue, (v) => { dialog.value = v })
watch(dialog, (v) => emit('update:modelValue', v))

watch(() => props.formulario, (formulario) => {
  if (!formulario) return
  titulo.value = `Preview: ${formulario.formulario}`
  dadosForm.value = {}
  mostrarDados.value = false
  modo.value = 'editar'
}, { immediate: true })

const validar = () => formularioRef.value?.validate?.()

const copiarDados = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(dadosForm.value, null, 2))
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: 'Dados copiados para a área de transferência!' },
    }))
  } catch {
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'error', message: 'Não foi possível copiar os dados.' },
    }))
  }
}
</script>

<style scoped>
pre {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 1rem;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>
