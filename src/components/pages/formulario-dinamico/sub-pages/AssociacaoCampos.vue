<template>
  <UmParaMuitosComponent2
      v-model="proxyModel"
      :titulo="`Campos do formulário: ${formulario?.formulario}`"
      :entidade-id="formulario?.id"
      endpoint-api="wf/forms/formularios-campos"
      campo-entidade-id="ctrl_formulario_id"
      campo-ids-associados="campos_ids"
      :selecionados="camposSelecionados"
      :todos-itens="todosCampos"
      @salvo="emit('salvo')"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'
import api from '@/services/api.js'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  formulario: { type: Object,  required: true },
})

const emit = defineEmits(['update:modelValue', 'salvo'])

const proxyModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const camposSelecionados = ref([])
const todosCampos = ref([])

onMounted(async () => {
  const [resTodos, resAssociados] = await Promise.all([
    api.get('wf/forms/campos'),
    api.get(`wf/forms/formularios-campos/${props.formulario.id}`),
  ])

  const grupos = []
  for (const c of resTodos.data.data) {
    const nomeGrupo = c.grupo || 'Sem grupo'
    let grupo = grupos.find(g => g.grupo === nomeGrupo)
    if (!grupo) {
      grupo = { grupo: nomeGrupo, options: [] }
      grupos.push(grupo)
    }
    grupo.options.push({ value: c.id, text: c.campo })
  }
  grupos.sort((a, b) => a.grupo.localeCompare(b.grupo))
  todosCampos.value = grupos

  camposSelecionados.value = resAssociados.data.data.map(c => c.id)
})
</script>
