<template>
  <ContainerComponent>
    <CardComponent
      max-width="1400"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — vis-network (dataset completo, {{ tarefaIds.length }} tarefas)
      </CardTitleComponent>
      <CardTextComponent>
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

        <template v-else>
          <div class="controles">
            <div class="legenda">
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--avanco" />
                Avanço
              </span>
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--devolucao" />
                Devolução
              </span>
            </div>

            <div class="controles__filtros">
              <CheckboxComponent
                v-model="tiposVisiveis"
                :items="tipoItems"
                inline
              />
              <RadioComponent
                v-model="layoutMode"
                :items="layoutItems"
                inline
                required
              />
            </div>
          </div>

          <div
            ref="containerRef"
            class="fluxo-wrapper"
          />
        </template>
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import RadioComponent from '@/components/comuns/forms/RadioComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import { useMobilidadesRelatorio, MOBILIDADE_TIPO } from './data/mobilidadesRelatorioService.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'

const tipoItems = [
  { text: 'Avanço', value: MOBILIDADE_TIPO.AVANCO },
  { text: 'Devolução', value: MOBILIDADE_TIPO.DEVOLUCAO },
]
const layoutItems = [
  { text: 'Layout físico (force-directed)', value: 'physics' },
  { text: 'Layout hierárquico', value: 'hierarchical' },
]

const tiposVisiveis = ref([MOBILIDADE_TIPO.AVANCO, MOBILIDADE_TIPO.DEVOLUCAO])
const layoutMode = ref('physics')

const { buscarMobilidades } = useMobilidadesRelatorio()

const carregando = ref(true)
const erro = ref(null)
const tarefaIds = ref([])

let edgesBase = []
let edgesDataSet = null

// Diferente do Vue Flow, o vis-network calcula o posicionamento sozinho —
// não depende de uma lib de layout externa (dagre). "physics" usa simulação
// de forças (força repulsiva entre nós, mola nas arestas); "hierarchical"
// organiza em níveis a partir da direção das arestas, análogo ao dagre LR.
function construirOpcoes(modo) {
  return {
    physics: {
      enabled: modo === 'physics',
      stabilization: { iterations: 300 },
      barnesHut: { gravitationalConstant: -4000, springLength: 130, springConstant: 0.02 },
    },
    layout: {
      hierarchical: modo === 'hierarchical'
        ? { enabled: true, direction: 'LR', sortMethod: 'directed', levelSeparation: 150, nodeSpacing: 70 }
        : { enabled: false },
    },
    nodes: {
      shape: 'circle',
      font: { size: 14 },
      color: { background: '#fff', border: '#4A6CF7' },
      borderWidth: 2,
      size: 22,
    },
    edges: {
      // O smooth real vem por aresta (curvedCW/CCW, ver edgesBase) pra
      // separar avanço de devolução; aqui fica só um fallback.
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      width: 1,
    },
    interaction: { navigationButtons: true, keyboard: true, hover: true },
  }
}

const containerRef = ref(null)
let network = null

onMounted(async () => {
  try {
    const { tarefas, mobilidades } = await buscarMobilidades()
    tarefaIds.value = tarefas.map((tarefa) => tarefa.id).sort((a, b) => a - b)

    // Mantém o design original desta POC: nós identificados só pelo ID (as
    // versões com nome de tarefa/macroprocesso ficam nos dashboards
    // "Nomeada"), igual à versão Vue Flow, para manter as duas POCs
    // comparáveis.
    const nodesDataSet = new DataSet(
      tarefaIds.value.map((id) => ({ id: String(id), label: String(id) }))
    )

    // No dado real, quase toda tarefa tem avanço e devolução ligando o
    // MESMO par de nós — com linha reta (smooth:false) as duas ficam
    // sobrepostas e só a última desenhada aparece. curvedCW/CCW arqueia
    // cada sentido pra um lado diferente, igual à versão simples.
    edgesBase = mobilidades.map((mobilidade) => {
      const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
      return {
        id: `mob-${mobilidade.id}`,
        tipoId: mobilidade.tipoId,
        from: String(mobilidade.origemId),
        to: String(mobilidade.destinoId),
        color: { color: avanco ? COR_AVANCO : COR_DEVOLUCAO },
        smooth: { type: avanco ? 'curvedCW' : 'curvedCCW', roundness: 0.15 },
      }
    })

    edgesDataSet = new DataSet(edgesBase.filter((edge) => tiposVisiveis.value.includes(edge.tipoId)))

    carregando.value = false
    // O container só entra no DOM depois que "carregando" vira false (v-else);
    // sem o nextTick, containerRef.value ainda seria null aqui.
    await nextTick()
    network = new Network(
      containerRef.value,
      { nodes: nodesDataSet, edges: edgesDataSet },
      construirOpcoes(layoutMode.value)
    )
  } catch (erroCapturado) {
    erro.value = erroCapturado.message || 'Não foi possível carregar as mobilidades do relatório.'
    carregando.value = false
  }
})

onBeforeUnmount(() => {
  network?.destroy()
  network = null
})

watch(tiposVisiveis, (tipos) => {
  edgesDataSet?.clear()
  edgesDataSet?.add(edgesBase.filter((edge) => tipos.includes(edge.tipoId)))
})

watch(layoutMode, (modo) => {
  network?.setOptions(construirOpcoes(modo))
  // setOptions troca a configuração, mas não força um novo cálculo de
  // posições sozinho — sem o stabilize() explícito os nós ficam "presos"
  // nas posições do layout anterior mesmo depois de trocar o modo.
  network?.stabilize()
})
</script>

<style scoped>
.estado-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.controles {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.controles__filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.legenda {
  display: flex;
  gap: 24px;
  padding-top: 8px;
}

.legenda__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legenda__linha {
  width: 28px;
  height: 3px;
  border-radius: 2px;
  display: inline-block;
}

.legenda__linha--avanco {
  background: #3B82F6;
}

.legenda__linha--devolucao {
  background: #EF4444;
}

.fluxo-wrapper {
  height: 75vh;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
</style>
