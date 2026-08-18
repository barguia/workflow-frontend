<template>
  <ContainerComponent>
    <CardComponent
      max-width="1400"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — vis-network (dataset nomeado completo, {{ tarefas.length }} tarefas)
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
              <span
                v-for="macroprocesso in macroprocessos"
                :key="macroprocesso"
                class="legenda__item"
              >
                <span
                  class="legenda__bolinha"
                  :style="{ borderColor: corPorMacroprocesso(macroprocesso) }"
                />
                {{ macroprocesso }}
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

const CORES_MACROPROCESSO = {
  Iniciação: '#8B5CF6',
  Planejamento: '#F59E0B',
  Execução: '#10B981',
  'Monitoramento e Controle': '#06B6D4',
  Encerramento: '#EC4899',
}
const FUNDOS_MACROPROCESSO = {
  Iniciação: '#F5F3FF',
  Planejamento: '#FFFBEB',
  Execução: '#ECFDF5',
  'Monitoramento e Controle': '#ECFEFF',
  Encerramento: '#FDF2F8',
}
const corPorMacroprocesso = (macroprocesso) => CORES_MACROPROCESSO[macroprocesso] ?? '#4A6CF7'
const fundoPorMacroprocesso = (macroprocesso) => FUNDOS_MACROPROCESSO[macroprocesso] ?? '#fff'

// Ordem fixa do ciclo de vida do projeto: usada tanto para a legenda quanto
// para o "level" explícito de cada tarefa no layout hierárquico, garantindo
// que as tarefas fiquem visualmente agrupadas por macroprocesso em vez de
// espalhadas pela ordenação automática (que só olha a direção das arestas).
const ORDEM_MACROPROCESSO = ['Iniciação', 'Planejamento', 'Execução', 'Monitoramento e Controle', 'Encerramento']
const nivelPorMacroprocesso = new Map(ORDEM_MACROPROCESSO.map((macroprocesso, indice) => [macroprocesso, indice]))

const tipoItems = [
  { text: 'Avanço', value: MOBILIDADE_TIPO.AVANCO },
  { text: 'Devolução', value: MOBILIDADE_TIPO.DEVOLUCAO },
]
const layoutItems = [
  { text: 'Layout hierárquico (agrupado por macroprocesso)', value: 'hierarchical' },
  { text: 'Layout físico (force-directed)', value: 'physics' },
]

const tiposVisiveis = ref([MOBILIDADE_TIPO.AVANCO, MOBILIDADE_TIPO.DEVOLUCAO])
const layoutMode = ref('hierarchical')

const { buscarMobilidades } = useMobilidadesRelatorio()

const carregando = ref(true)
const erro = ref(null)
const tarefas = ref([])
const macroprocessos = ref([])

let edgesBase = []
let nodesDataSet = null
let edgesDataSet = null

// Diferente do Vue Flow, o vis-network calcula o posicionamento sozinho —
// não depende de uma lib de layout externa (dagre). "hierarchical" usa o
// "level" fixo por macroprocesso (ver nivelPorMacroprocesso) para desenhar
// uma coluna por macroprocesso, o que mantém o agrupamento por cor estável;
// "physics" ignora esse level e deixa a simulação de forças (repulsão entre
// nós, mola nas arestas) decidir a posição — por isso tende a misturar as
// cores mesmo com o mesmo dataset.
function construirOpcoes(modo) {
  return {
    physics: {
      enabled: modo === 'physics',
      stabilization: { iterations: 300 },
      barnesHut: { gravitationalConstant: -8000, springLength: 180, springConstant: 0.02, avoidOverlap: 0.6 },
    },
    layout: {
      // Direção "UD" (cima→baixo) em vez de "LR": com 5 níveis fixos e até
      // 16 tarefas por nível, uma coluna por macroprocesso (LR) fica muito
      // alta e estreita — a área de desenho é bem mais larga que alta. Em
      // linhas, cada macroprocesso ocupa a largura toda do container.
      hierarchical: modo === 'hierarchical'
        ? { enabled: true, direction: 'UD', sortMethod: 'directed', levelSeparation: 140, nodeSpacing: 190 }
        : { enabled: false },
    },
    nodes: {
      shape: 'box',
      shapeProperties: { borderRadius: 10 },
      margin: { top: 8, right: 10, bottom: 8, left: 10 },
      font: { size: 11, multi: true, align: 'center' },
      borderWidth: 2,
      widthConstraint: { minimum: 140, maximum: 160 },
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
    const { tarefas: tarefasApi, mobilidades } = await buscarMobilidades()
    tarefas.value = tarefasApi
    macroprocessos.value = ORDEM_MACROPROCESSO.filter((macroprocesso) =>
      tarefasApi.some((tarefa) => tarefa.macroprocesso === macroprocesso)
    )

    // Grupo por macroprocesso: cada tarefa carrega o nome completo como
    // label (quebrado em duas linhas) e o processo/macroprocesso no
    // tooltip. O "level" fixa a coluna no layout hierárquico (ver
    // ORDEM_MACROPROCESSO acima).
    nodesDataSet = new DataSet(
      tarefasApi.map((tarefa) => ({
        id: tarefa.id,
        label: `${tarefa.tarefa}\n${tarefa.processo}`,
        title: `${tarefa.tarefa} — ${tarefa.processo} (${tarefa.macroprocesso})`,
        level: nivelPorMacroprocesso.get(tarefa.macroprocesso) ?? 0,
        color: { background: fundoPorMacroprocesso(tarefa.macroprocesso), border: corPorMacroprocesso(tarefa.macroprocesso) },
      }))
    )

    // No dado real, quase toda tarefa tem avanço e devolução ligando o
    // MESMO par de nós (B avança pra C, C devolve pra B) — com uma linha
    // reta só (smooth:false) as duas ficam sobrepostas e só a última
    // desenhada aparece. curvedCW/CCW arqueia cada sentido pra um lado
    // diferente, igual à versão simples.
    edgesBase = mobilidades.map((mobilidade) => {
      const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
      return {
        id: `mob-${mobilidade.id}`,
        tipoId: mobilidade.tipoId,
        from: mobilidade.origemId,
        to: mobilidade.destinoId,
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
  // nas posições da malha hierárquica mesmo depois de ligar a física.
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
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 8px;
}

.legenda__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
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

.legenda__bolinha {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid;
  background: #fff;
  display: inline-block;
}

.fluxo-wrapper {
  height: 75vh;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
</style>
