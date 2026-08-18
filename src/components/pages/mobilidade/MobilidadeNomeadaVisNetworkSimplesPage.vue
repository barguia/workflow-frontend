<template>
  <ContainerComponent>
    <CardComponent
      max-width="1200"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — vis-network (exemplo simples, dados nomeados)
      </CardTitleComponent>
      <CardTextComponent>
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

        <div
          ref="containerRef"
          class="fluxo-wrapper"
        />
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import { listarMobilidades, listarTarefas, MOBILIDADE_TIPO } from './data/normalizarMobilidadesNomeadas.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'

// Mesmo recorte simples da versão Vue Flow: a cadeia linear de
// "Identificação da Demanda" (registrar → descrever → definir objetivo →
// classificar tipo), equivalente ao A → B → C → D do MobilidadeExemploPage.
const IDS_TAREFAS_EXIBIDAS = [54, 26, 23, 15]
const POSICOES_X = [0, 280, 560, 840]

const tarefas = listarTarefas()
const tarefaPorId = new Map(tarefas.map((tarefa) => [tarefa.id, tarefa]))

const nodes = new DataSet(
  IDS_TAREFAS_EXIBIDAS.map((id, indice) => {
    const tarefa = tarefaPorId.get(id)
    return {
      id,
      label: `${tarefa.tarefa}\n${tarefa.processo}`,
      title: `${tarefa.tarefa} — ${tarefa.processo} (${tarefa.macroprocesso})`,
      x: POSICOES_X[indice],
      y: 160,
      fixed: true,
    }
  })
)

const mobilidades = listarMobilidades().filter(
  (mobilidade) =>
    IDS_TAREFAS_EXIBIDAS.includes(mobilidade.origemId) &&
    IDS_TAREFAS_EXIBIDAS.includes(mobilidade.destinoId)
)

// vis-network curva arestas paralelas em sentidos opostos (curvedCW/curvedCCW)
// para separar visualmente avanço e devolução entre o mesmo par de tarefas.
const edges = new DataSet(
  mobilidades.map((mobilidade) => {
    const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
    return {
      from: mobilidade.origemId,
      to: mobilidade.destinoId,
      color: { color: avanco ? COR_AVANCO : COR_DEVOLUCAO },
      smooth: { type: avanco ? 'curvedCW' : 'curvedCCW', roundness: 0.2 },
    }
  })
)

const options = {
  physics: false,
  interaction: { dragNodes: false, zoomView: false, dragView: false },
  nodes: {
    shape: 'box',
    shapeProperties: { borderRadius: 10 },
    margin: { top: 10, right: 12, bottom: 10, left: 12 },
    font: { size: 13, multi: true, align: 'center' },
    color: { background: '#fff', border: '#4A6CF7' },
    borderWidth: 2,
    widthConstraint: { minimum: 160, maximum: 190 },
  },
  edges: {
    arrows: { to: { enabled: true, scaleFactor: 0.7 } },
    width: 2,
  },
}

const containerRef = ref(null)
let network = null

onMounted(() => {
  network = new Network(containerRef.value, { nodes, edges }, options)
})

onBeforeUnmount(() => {
  network?.destroy()
  network = null
})
</script>

<style scoped>
.legenda {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
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
  height: 420px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
</style>
