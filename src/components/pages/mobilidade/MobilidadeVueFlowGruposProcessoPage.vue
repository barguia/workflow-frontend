<script setup>
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

// Grupos de processo do PMBOK — vão virar os nodes "parent".
const gruposProcesso = [
  { id: 'iniciacao', label: 'Iniciação', x: 0, cor: 'rgba(59, 130, 246, 0.5)' },
  { id: 'planejamento', label: 'Planejamento', x: 320, cor: 'rgba(139, 92, 246, 0.5)' },
  { id: 'execucao', label: 'Execução', x: 640, cor: 'rgba(16, 185, 129, 0.5)' },
  { id: 'monitoramento-controle', label: 'Monitoramento e Controle', x: 960, cor: 'rgba(245, 158, 11, 0.5)' },
  { id: 'encerramento', label: 'Encerramento', x: 1280, cor: 'rgba(239, 68, 68, 0.5)' },
]

// Subprocessos hardcoded — viram nodes "subparent" (aninhados no grupo via
// `parentNode`). Ficam com um estilo neutro, já que ainda vão receber seus
// próprios filhos (tarefas) depois.
const subprocessos = [
  { label: 'Identificação da Demanda', ordenacao: 0, grupoId: 'iniciacao' },
  { label: 'Análise de Viabilidade', ordenacao: 1, grupoId: 'iniciacao' },
  { label: 'Aprovação do Projeto', ordenacao: 2, grupoId: 'iniciacao' },
  { label: 'Planejamento do Escopo', ordenacao: 0, grupoId: 'planejamento' },
  { label: 'Planejamento de Cronograma', ordenacao: 1, grupoId: 'planejamento' },
  { label: 'Planejamento de Recursos', ordenacao: 2, grupoId: 'planejamento' },
  { label: 'Planejamento de Custos', ordenacao: 3, grupoId: 'planejamento' },
  { label: 'Planejamento de Riscos', ordenacao: 4, grupoId: 'planejamento' },
  { label: 'Execução das Atividades', ordenacao: 0, grupoId: 'execucao' },
  { label: 'Gestão da Equipe', ordenacao: 1, grupoId: 'execucao' },
  { label: 'Comunicação com Stakeholders', ordenacao: 2, grupoId: 'execucao' },
  { label: 'Controle de Prazo', ordenacao: 0, grupoId: 'monitoramento-controle' },
  { label: 'Controle de Custos', ordenacao: 1, grupoId: 'monitoramento-controle' },
  { label: 'Controle de Qualidade', ordenacao: 2, grupoId: 'monitoramento-controle' },
  { label: 'Gestão de Mudanças', ordenacao: 3, grupoId: 'monitoramento-controle' },
  { label: 'Entrega do Projeto', ordenacao: 0, grupoId: 'encerramento' },
  { label: 'Documentação Final', ordenacao: 1, grupoId: 'encerramento' },
  { label: 'Encerramento Administrativo', ordenacao: 2, grupoId: 'encerramento' },
]

const GRUPO_WIDTH = 280
const GRUPO_OFFSET_TOP = 50
const GRUPO_OFFSET_BOTTOM = 20
const SUBPROCESSO_WIDTH = 240
const SUBPROCESSO_HEIGHT = 44
const SUBPROCESSO_OFFSET_X = 20
const SUBPROCESSO_GAP_Y = 16

function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function alturaGrupo(quantidadeSubprocessos) {
  return (
    GRUPO_OFFSET_TOP +
    quantidadeSubprocessos * SUBPROCESSO_HEIGHT +
    (quantidadeSubprocessos - 1) * SUBPROCESSO_GAP_Y +
    GRUPO_OFFSET_BOTTOM
  )
}

const nodesGrupos = gruposProcesso.map((grupo) => {
  const quantidade = subprocessos.filter((subprocesso) => subprocesso.grupoId === grupo.id).length

  return {
    id: grupo.id,
    data: { label: grupo.label },
    position: { x: grupo.x, y: 0 },
    style: { backgroundColor: grupo.cor, width: `${GRUPO_WIDTH}px`, height: `${alturaGrupo(quantidade)}px` },
  }
})

const nodesSubprocessos = subprocessos.map((subprocesso) => ({
  id: `${subprocesso.grupoId}-${slugify(subprocesso.label)}`,
  data: { label: subprocesso.label },
  position: {
    x: SUBPROCESSO_OFFSET_X,
    y: GRUPO_OFFSET_TOP + subprocesso.ordenacao * (SUBPROCESSO_HEIGHT + SUBPROCESSO_GAP_Y),
  },
  parentNode: subprocesso.grupoId,
  extent: 'parent',
  style: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(44, 62, 80, 0.3)',
    width: `${SUBPROCESSO_WIDTH}px`,
    height: `${SUBPROCESSO_HEIGHT}px`,
  },
}))

const nodes = ref([...nodesGrupos, ...nodesSubprocessos])

const edges = ref([])
</script>

<template>
  <div class="grupos-processo-flow">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      fit-view-on-init
      elevate-edges-on-select
    >
      <MiniMap />

      <Controls />

      <Background />
    </VueFlow>
  </div>
</template>

<style scoped>
.grupos-processo-flow {
  height: 100vh;
  width: 100%;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.grupos-processo-flow :deep(.vue-flow__minimap) {
  transform: scale(75%);
  transform-origin: bottom right;
}
</style>
