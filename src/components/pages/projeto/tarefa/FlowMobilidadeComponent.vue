<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import api from '@/services/api.js'
import HierarquiaFlowComponent from '@/components/comuns/flow/HierarquiaFlowComponent.vue'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'

// Diagrama de mobilidade de um workflow inteiro (macroprocesso > processo >
// tarefa, com avanço/devolução entre tarefas), consumindo
// GET /api/wf/workflows-estrutura-com-mobilidades/{ctrlWorkflowId}.
const props = defineProps({
  ctrlWorkflowId: { type: [Number, String], required: true },
  // Se informado, destaca visualmente o node da tarefa correspondente
  // (ex: a tarefa que está sendo visualizada na página).
  tarefaDestaqueId: { type: [Number, String], default: null },
  height: { type: String, default: '600px' },
})

// Cores/handles por tipo de relacionamento são decisão do frontend — o
// backend só devolve `{ id, label }`. Chaveado pelo label porque ele reflete
// o enum estável do backend (CtrlMobilidadeTipoEnum: Avanço/Devolução).
const CORES_TIPO = { Devolução: '#EF4444' }
const HANDLES_TIPO = {
  Avanço: { source: 'bottom', target: 'top' },
  Devolução: { source: 'left', target: 'right' },
}
const TIPO_COM_ANIMACAO_EM_CADEIA = 'Devolução'

const carregando = ref(true)
const erro = ref(null)
const estrutura = ref(null)

async function carregar() {
  carregando.value = true
  erro.value = null

  try {
    const { data } = await api.get(`wf/workflows-estrutura-com-mobilidades/${props.ctrlWorkflowId}`)
    estrutura.value = data.data
  } catch (erroCapturado) {
    erro.value = erroCapturado.message || 'Não foi possível carregar a estrutura de mobilidade.'
  } finally {
    carregando.value = false
  }
}

watch(() => props.ctrlWorkflowId, carregar)
onMounted(carregar)

// Nível mais profundo da hierarquia — usado como fallback para tarefas cujo
// `ctrl_hierarquia_id` ainda não foi preenchido na base (aparecem com
// `nivel: null` na API). Sem isso o layout não consegue posicioná-las.
const nivelFolhaId = computed(() => {
  const hierarquias = estrutura.value?.hierarquias ?? []
  if (hierarquias.length === 0) return null

  // Folha = nível que nenhum outro declara como `nivelPai` (ver comentário
  // em `hierarquias` abaixo — não dá pra confiar em `profundidade`).
  const niveisComFilhos = new Set(hierarquias.filter((nivel) => nivel.nivelPai != null).map((nivel) => nivel.nivelPai))
  return hierarquias.find((nivel) => !niveisComFilhos.has(nivel.id))?.id ?? null
})

const hierarquias = computed(() => {
  const niveis = estrutura.value?.hierarquias ?? []

  // Folha = nível que nenhum outro declara como `nivelPai` — não dá pra
  // assumir que o último item do array (ordenado por `profundidade`) é a
  // folha, porque isso depende de `profundidade` estar corretamente
  // configurado em todo workflow (não estava para o workflow 2, o que fazia
  // as tarefas caírem no nível errado e ficarem horizontais em vez de
  // verticais).
  const niveisComFilhos = new Set(niveis.filter((nivel) => nivel.nivelPai != null).map((nivel) => nivel.nivelPai))

  return niveis.map((nivel) => {
    const ehRaiz = nivel.nivelPai == null
    const ehFolha = !niveisComFilhos.has(nivel.id)

    return {
      nivel: nivel.id,
      nivelPai: nivel.nivelPai,
      orientacao: ehFolha ? 'vertical' : 'horizontal',
      espacamentoIrmaos: ehFolha ? 32 : ehRaiz ? 60 : 16,
      paddingConteudo: ehRaiz ? { topo: 50, fundo: 20, lateral: 20 } : { topo: 60, fundo: 10, lateral: 10 },
      ...(ehFolha ? { largura: 130, altura: 46 } : {}),
    }
  })
})

const nodes = computed(() => {
  // Nodes de processo/tarefa vêm com id no formato `processo-{id}`/`tarefa-{id}`
  // (ver EngineCtrlWorkflowService::estruturaComMobilidades) — os ids das
  // duas tabelas não são únicos entre si, então precisam desse prefixo.
  const tarefaDestaqueId = props.tarefaDestaqueId != null ? `tarefa-${props.tarefaDestaqueId}` : null

  return (estrutura.value?.nodes ?? []).map((node) => ({
    id: node.id,
    label: node.label,
    nivel: node.nivel ?? nivelFolhaId.value,
    parentId: node.parentId,
    ordenacao: node.ordenacao,
    ...(node.id === tarefaDestaqueId
      ? { estilo: { border: '3px solid #fdd023', boxShadow: '0 0 0 2px rgba(253, 208, 35, 0.3)' } }
      : {}),
  }))
})

const tiposRelacionamento = computed(() =>
  (estrutura.value?.tiposRelacionamento ?? []).map((tipo) => ({
    id: tipo.id,
    label: tipo.label,
    animado: true,
    cor: CORES_TIPO[tipo.label],
    handles: HANDLES_TIPO[tipo.label],
    animarCadeiaDuploClique: tipo.label === TIPO_COM_ANIMACAO_EM_CADEIA,
  })),
)

const relacionamentos = computed(() => estrutura.value?.relacionamentos ?? [])

const tipoItems = computed(() => tiposRelacionamento.value.map((tipo) => ({ text: tipo.label, value: tipo.id })))
const tiposVisiveis = ref([])

watch(
  tiposRelacionamento,
  (tipos) => {
    tiposVisiveis.value = tipos.map((tipo) => tipo.id)
  },
  { immediate: true },
)

// Movimentação manual vem desabilitada por padrão — o layout é calculado.
const movimentacaoHabilitada = ref(false)
</script>

<template>
  <div
    class="flow-mobilidade-component"
    :style="{ height }"
  >
    <div
      v-if="carregando"
      class="estado-wrapper"
    >
      <ProgressCircularComponent
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <AlerComponent
      v-else-if="erro"
      type="error"
      variant="tonal"
    >
      {{ erro }}
    </AlerComponent>

    <HierarquiaFlowComponent
      v-else
      :hierarquias="hierarquias"
      :nodes="nodes"
      :tipos-relacionamento="tiposRelacionamento"
      :relacionamentos="relacionamentos"
      :tipos-visiveis="tiposVisiveis"
      :nodes-draggable="movimentacaoHabilitada"
    >
      <Panel
        class="filtro-panel"
        position="top-right"
      >
        <CheckboxComponent
          v-model="tiposVisiveis"
          :items="tipoItems"
          inline
        />

        <v-divider class="my-1" />

        <v-checkbox
          v-model="movimentacaoHabilitada"
          label="Movimentação manual"
          density="compact"
          hide-details
        />
      </Panel>

      <MiniMap />

      <Controls />

      <Background />
    </HierarquiaFlowComponent>
  </div>
</template>

<style scoped>
.flow-mobilidade-component {
  width: 100%;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.estado-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filtro-panel {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: #2c3e50;
}
</style>
