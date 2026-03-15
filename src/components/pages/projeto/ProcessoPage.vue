<template>
  <CrudComponent
      route="wf/processos"
      title="Processos"
      :fields="fields"
      :headers="headers"
      :context="auxiliares"
  >
  </CrudComponent>
</template>

<script setup>
import CrudComponent from '@/components/crud/CrudComponent.vue'
import {useCrud} from "@/services/useCrud.js";
import {ref, computed} from "vue";
const { index: fetchWorkflow } = useCrud('wf/workflows')
const { index: fetchHierarquia } = useCrud('wf/hierarquias')
const { index: fetchProcesso } = useCrud('wf/processos')

const hierarquias = ref({})
const processosRelacionados = ref({})

const auxiliares = computed(() => ({
  hierarquias: hierarquias.value,
  processosRelacionados: processosRelacionados.value,
}))

const carregarHierarquias = async (workflowId) => {
  if (!workflowId) {
    hierarquias.value = {}
    return
  }
  const data = await fetchHierarquia({
    ctrl_workflow_id: workflowId,
    with: 'macro_hierarquia,sub_hierarquia'
  })
  hierarquias.value = Object.fromEntries(data.map(h => [h.id, h]))
}

const fields = [
  {
    key: 'ctrl_workflow_id',
    label: 'Workflow',
    type: 'select',
    options: async () => {
      const workflows = await fetchWorkflow()
      return workflows
          .map(workflow => ({ value: workflow.id, text: workflow.workflow }));
    },
    onChange: async ({ setField , form}) => {
      setField('ctrl_hierarquia_id', null)
      setField('ctrl_processo_id', null)
      await carregarHierarquias(form.ctrl_workflow_id)
    },
    defaultValue: null,
    rules: [v => !!v || 'Workflow é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_hierarquia_id',
    label: 'Nível de Hierarquia',
    type: 'select',
    dependsOn: 'ctrl_workflow_id',
    disabled: f => !f.ctrl_workflow_id,
    options: async (f) => {
      const fields = await fetchHierarquia({ctrl_workflow_id: f.ctrl_workflow_id})
      return fields
          .map(field => ({ value: field.id, text: field.hierarquia }));
    },
    onChange: async ({ setField, form, context }) => {
      setField('ctrl_processo_id', null)

      const hierarquiaAtual = context.hierarquias[form.ctrl_hierarquia_id]
      if (!hierarquiaAtual?.ctrl_macro_hierarquia_id) {
        context.processosRelacionados[form.ctrl_hierarquia_id] = []
        return
      }

      try {
        const data = await fetchProcesso({
          ctrl_hierarquia_id: hierarquiaAtual.ctrl_macro_hierarquia_id,
          ctrl_workflow_id: form.ctrl_workflow_id
        })

        const opcoes = data.map(d => ({ value: d.id, text: d.processo }))
        context.processosRelacionados[form.ctrl_hierarquia_id] = opcoes
      } catch (err) {
        console.error('Erro ao carregar processos relacionados', err)
        context.processosRelacionados[form.ctrl_hierarquia_id] = []
      }
    },
    defaultValue: null,
    rules: [v => !!v || 'Hierarquia é obrigatório'],
    optional: false
  },
  {
    key: 'ctrl_processo_id',
    label: 'Processo Relacionado',
    type: 'select',
    dependsOn: 'ctrl_hierarquia_id',  // ← mantém
    visible: (form, context) => {
      const hierarquiaAtual = context.hierarquias[form.ctrl_hierarquia_id]
      return !!hierarquiaAtual?.ctrl_macro_hierarquia_id
    },
    disabled: f => !f.ctrl_hierarquia_id,
    options: (form, context) => {
      return context.processosRelacionados[form.ctrl_hierarquia_id] || []
    },
    rules: (form, context) => {
      const hierarquiaAtual = context.hierarquias[form.ctrl_hierarquia_id]
      const precisaProcesso = !!hierarquiaAtual?.ctrl_macro_hierarquia_id
      return precisaProcesso ? [v => !!v || 'Processo relacionado é obrigatório'] : []
    }
  },
  {
    key: 'processo',
    label: 'Processo',
    type: 'text',
    rules: [v => !!v || 'Processo é obrigatório'],
    optional: false
  },
]

const headers = [
  { title: 'Processo', value: 'processo' },
  { title: 'Hierarquia', value: 'hierarquia.hierarquia' },
  { title: 'Workflow', value: 'workflow.workflow' },
  { title: '', value: 'actions'}
]
</script>