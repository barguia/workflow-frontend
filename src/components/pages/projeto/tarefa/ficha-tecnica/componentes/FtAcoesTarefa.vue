<template>
  <!-- Barra de ações -->
  <CardComponent rounded="xl" variant="elevated" class="mb-6">
    <CardTextComponent class="pa-4 d-flex align-center gap-3 flex-wrap">
      <div class="section-label">Ações</div>
      <SpacerComponent />
      <ButtonComponent
        color="primary"
        variant="tonal"
        size="small"
        :disabled="!!tarefa.finalized_at"
        @click="abrirDialog"
      >
        <IconComponent start>mdi-clipboard-edit-outline</IconComponent>
        Registrar Tratamento
      </ButtonComponent>
    </CardTextComponent>
  </CardComponent>

  <!-- Dialog: Registrar Tratamento -->
  <DialogComponent
    v-if="dialog"
    v-model="dialog"
    max-width="560px"
    @keydown.esc="fecharDialog"
  >
    <CardComponent rounded="lg">
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="primary" size="22">mdi-clipboard-edit-outline</IconComponent>
        <span class="text-h6">Registrar Tratamento</span>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="fecharDialog" />
      </CardTitleComponent>

      <CardTextComponent class="pt-5 pb-2 px-6">
        <div class="text-caption text-medium-emphasis mb-4">
          {{ tarefa.tarefa }} · {{ tarefa.processo }}
        </div>

        <SelectComponent
          v-model="form.ctrl_status_id"
          label="Status"
          :items="opcoesStatus"
          :loading="carregandoStatus"
          :rules="[v => !!v || 'Status é obrigatório']"
          clearable
          class="mb-4"
        />

        <TextAreaComponent
          v-model="form.comentario"
          label="Comentário"
          rows="4"
          auto-grow
          counter
          maxlength="1000"
          variant="outlined"
          density="comfortable"
        />
      </CardTextComponent>

      <CardActionsComponent class="px-6 py-4 border-t">
        <SpacerComponent />
        <ButtonComponent variant="text" @click="fecharDialog">Cancelar</ButtonComponent>
        <ButtonComponent
          color="primary"
          variant="flat"
          :loading="salvando"
          :disabled="!form.ctrl_status_id"
          @click="salvar"
        >
          Salvar
        </ButtonComponent>
      </CardActionsComponent>
    </CardComponent>
  </DialogComponent>
</template>

<script setup>
import { ref } from 'vue'

import api from '@/services/api.js'
import { useCrud } from '@/services/useCrud.js'

import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardActionsComponent from '@/components/comuns/cards/CardActionsComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import DialogComponent from '@/components/comuns/dialogs/DialogComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import TextAreaComponent from '@/components/comuns/forms/TextAreaComponent.vue'

const props = defineProps({
  tarefa: { type: Object, required: true },
})

const emit = defineEmits(['tratamento-salvo', 'tratamento-erro'])

const { index: fetchStatus } = useCrud('wf/status')

const dialog          = ref(false)
const salvando        = ref(false)
const carregandoStatus = ref(false)
const opcoesStatus    = ref([])
const form = ref({ ctrl_status_id: null, comentario: '' })

async function abrirDialog() {
  form.value = { ctrl_status_id: null, comentario: '' }
  dialog.value = true

  if (opcoesStatus.value.length === 0) {
    carregandoStatus.value = true
    try {
      const data = await fetchStatus()
      opcoesStatus.value = (data ?? []).map(s => ({ value: s.id, text: s.status ?? String(s.id) }))
    } finally {
      carregandoStatus.value = false
    }
  }
}

function fecharDialog() {
  dialog.value = false
  setTimeout(() => { form.value = { ctrl_status_id: null, comentario: '' } }, 300)
}

async function salvar() {
  salvando.value = true
  try {
    await api.post('wf/tratamentos', {
      pco_tarefa_id:  props.tarefa.pco_tarefa_id,
      ctrl_status_id: form.value.ctrl_status_id,
      comentario:     form.value.comentario || null,
    })
    fecharDialog()
    emit('tratamento-salvo')
  } catch {
    emit('tratamento-erro')
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.55;
}
</style>
