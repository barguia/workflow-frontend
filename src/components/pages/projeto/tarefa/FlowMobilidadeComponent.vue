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
  height: { type: String, default: '900px' },
})

// Cores/handles por tipo de relacionamento são decisão do frontend — o
// backend só devolve `{ id, label }`. Chaveado pelo label porque ele reflete
// o enum estável do backend (CtrlMobilidadeTipoEnum: Avanço/Devolução). Cores
// sempre via variável CSS do tema (`rgb(var(--v-theme-X))`), nunca hex fixo —
// assim acompanham automaticamente qualquer um dos temas do projeto.
const CORES_TIPO = { Devolução: 'rgb(var(--v-theme-error))', 'Caminho Crítico': 'rgb(var(--v-theme-error))' }
const HANDLES_TIPO = {
  Avanço: { source: 'bottom', target: 'top' },
  Devolução: { source: 'left', target: 'right' },
  'Caminho Crítico': { source: 'right', target: 'left' },
}

// `caminho_critico` vem do backend como uma flag por mobilidade (pivot), não
// como um tipo de relacionamento próprio (só existem Avanço e Devolução —
// CtrlMobilidadeTipoEnum). Pro diagrama, ele é tratado como se fosse mais um
// tipo (`CAMINHO_CRITICO_ID`, só do frontend): cada mobilidade com
// `caminho_critico: true` gera uma edge ADICIONAL desse tipo entre a mesma
// origem/destino, junto (não no lugar) da edge de Avanço/Devolução — assim
// aparece no painel de filtro do mesmo jeito que os outros tipos, sem
// esconder nada.
const CAMINHO_CRITICO_ID = 'caminho-critico'

// Marcação visual das tarefas de início/fim de fluxo (`inicial`/`final`
// vindos do backend) — pill arredondado com fundo colorido, se sobrepondo ao
// cinza padrão das folhas. Fonte usa o `on-X` correspondente (contraste
// calculado automaticamente pelo Vuetify pra cada tema) em vez de branco fixo.
const CORES_MARCACAO = {
  inicial: { fundo: 'rgb(var(--v-theme-success))', fonte: 'rgb(var(--v-theme-on-success))' },
  final: { fundo: 'rgb(var(--v-theme-error))', fonte: 'rgb(var(--v-theme-on-error))' },
}

// Tarefas que participam de algum relacionamento com `caminho_critico: true`
// (origem ou destino) recebem o mesmo tratamento visual de marcação (fundo
// colorido + fonte de contraste), mas sem o pill arredondado das tarefas de
// início/fim. Cor de perigo (danger), já que representa o caminho crítico.
const COR_CAMINHO_CRITICO = { fundo: 'rgb(var(--v-theme-error))', fonte: 'rgb(var(--v-theme-on-error))' }

// Paleta padrão para os macroprocessos (nodes raiz) quando o backend não
// define uma `cor` — ciclada por node raiz (ordenado por `ordenacao`) pra
// não repetir cor entre irmãos. Igual à abordagem do exemplo
// (ExemploVueFlowGruposProcessoPage): só a raiz recebe cor própria, e
// semitransparente (alpha 0.5) — os níveis abaixo (processo/tarefa) não têm
// `cor` definida, então usam o fundo quase-opaco padrão do
// HierarquiaFlowComponent por cima, deixando a cor da raiz "vazar" de leve
// por trás em vez de cada nível ter sua própria cor sólida. Usa os tokens
// semânticos do tema (definidos em `main.js` pra todos os temas) em vez de
// hex fixo, pra não ficar fora de paleta em temas como `dark`/`aurora`.
const PALETA_CORES_RAIZ = [
  'rgba(var(--v-theme-primary), 0.5)',
  'rgba(var(--v-theme-secondary), 0.5)',
  'rgba(var(--v-theme-accent), 0.5)',
  'rgba(var(--v-theme-success), 0.5)',
  'rgba(var(--v-theme-warning), 0.5)',
  'rgba(var(--v-theme-error), 0.5)',
  'rgba(var(--v-theme-info), 0.5)',
  'rgba(var(--v-theme-teal), 0.5)',
]

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

const tiposRelacionamento = computed(() => [
  ...(estrutura.value?.tiposRelacionamento ?? []).map((tipo) => ({
    id: tipo.id,
    label: tipo.label,
    animado: true,
    cor: CORES_TIPO[tipo.label],
    handles: HANDLES_TIPO[tipo.label],
  })),
  {
    id: CAMINHO_CRITICO_ID,
    label: 'Caminho Crítico',
    animado: true,
    cor: CORES_TIPO['Caminho Crítico'],
    handles: HANDLES_TIPO['Caminho Crítico'],
  },
])

const relacionamentosBrutos = computed(() => estrutura.value?.relacionamentos ?? [])

// Cada mobilidade com `caminho_critico: true` gera uma edge extra do tipo
// "Caminho Crítico" (ver comentário em CAMINHO_CRITICO_ID acima), mantendo a
// edge original do seu tipo real (Avanço/Devolução) intacta — as duas
// aparecem ao mesmo tempo no diagrama, cada uma filtrável pelo seu próprio
// checkbox no painel.
const relacionamentos = computed(() =>
  relacionamentosBrutos.value.flatMap((relacionamento) => {
    const edge = {
      id: relacionamento.id,
      origemId: relacionamento.origemId,
      destinoId: relacionamento.destinoId,
      tipoId: relacionamento.tipoId,
    }
    if (!relacionamento.caminho_critico) return [edge]
    return [edge, { ...edge, id: `${relacionamento.id}-critico`, tipoId: CAMINHO_CRITICO_ID }]
  }),
)

// Ids das tarefas (origem ou destino) que participam de algum relacionamento
// com `caminho_critico: true` — usado pra colorir o node independente da
// direção em que ele aparece na cadeia. Não depende do checkbox de filtro:
// uma tarefa continua marcada como crítica mesmo com a edge "Caminho Crítico"
// escondida.
const idsCaminhoCritico = computed(() => {
  const ids = new Set()
  for (const relacionamento of relacionamentosBrutos.value) {
    if (!relacionamento.caminho_critico) continue
    ids.add(relacionamento.origemId)
    ids.add(relacionamento.destinoId)
  }
  return ids
})

const nodes = computed(() => {
  // Nodes de processo/tarefa vêm com id no formato `processo-{id}`/`tarefa-{id}`
  // (ver EngineCtrlWorkflowService::estruturaComMobilidades) — os ids das
  // duas tabelas não são únicos entre si, então precisam desse prefixo.
  const tarefaDestaqueId = props.tarefaDestaqueId != null ? `tarefa-${props.tarefaDestaqueId}` : null
  const brutos = estrutura.value?.nodes ?? []

  const corRaizPorId = new Map(
    brutos
      .filter((node) => node.parentId == null)
      .sort((a, b) => (a.ordenacao ?? 0) - (b.ordenacao ?? 0))
      .map((node, indice) => [node.id, PALETA_CORES_RAIZ[indice % PALETA_CORES_RAIZ.length]]),
  )

  return brutos.map((node) => {
    const marcacao = node.inicial ? CORES_MARCACAO.inicial : node.final ? CORES_MARCACAO.final : null
    const caminhoCritico = !marcacao && idsCaminhoCritico.value.has(node.id) ? COR_CAMINHO_CRITICO : null
    const cor = marcacao?.fundo ?? caminhoCritico?.fundo ?? node.cor ?? corRaizPorId.get(node.id)

    return {
      id: node.id,
      label: node.label,
      nivel: node.nivel ?? nivelFolhaId.value,
      parentId: node.parentId,
      ordenacao: node.ordenacao,
      inicial: node.inicial,
      final: node.final,
      ...(cor ? { cor } : {}),
      estilo: {
        ...(marcacao ? { borderRadius: '999px', color: marcacao.fonte } : {}),
        ...(caminhoCritico ? { color: caminhoCritico.fonte } : {}),
        ...(node.id === tarefaDestaqueId
          ? {
              border: '3px solid rgb(var(--v-theme-warning))',
              boxShadow: '0 0 0 2px rgba(var(--v-theme-warning), 0.3)',
            }
          : {}),
      },
    }
  })
})

// "Caminho Crítico" já entra em `tiposRelacionamento` (ver acima) como se
// fosse mais um tipo, então cai naturalmente no mesmo grupo de checkboxes de
// Avanço/Devolução, com filtro por `tipoId` igual aos demais — sem tratamento
// especial aqui.
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
  background-color: rgba(var(--v-theme-surface), 0.95);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 0 10px rgba(var(--v-theme-on-surface), 0.3);
  color: rgb(var(--v-theme-on-surface));
}
</style>
