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
  { id: 'iniciacao', label: 'Iniciação', cor: 'rgba(59, 130, 246, 0.5)' },
  { id: 'planejamento', label: 'Planejamento', cor: 'rgba(139, 92, 246, 0.5)' },
  { id: 'execucao', label: 'Execução', cor: 'rgba(16, 185, 129, 0.5)' },
  { id: 'monitoramento-controle', label: 'Monitoramento e Controle', cor: 'rgba(245, 158, 11, 0.5)' },
  { id: 'encerramento', label: 'Encerramento', cor: 'rgba(239, 68, 68, 0.5)' },
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

const GRUPO_OFFSET_TOP = 50
const GRUPO_OFFSET_BOTTOM = 20
const GRUPO_GAP_X = 60
const GRUPO_HEIGHT = GRUPO_OFFSET_TOP + 70 + GRUPO_OFFSET_BOTTOM
const SUBPROCESSO_WIDTH = 170
const SUBPROCESSO_HEIGHT = 70
const SUBPROCESSO_OFFSET_X = 20
const SUBPROCESSO_GAP_X = 16

function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function larguraGrupo(quantidadeSubprocessos) {
  return (
    SUBPROCESSO_OFFSET_X * 2 +
    quantidadeSubprocessos * SUBPROCESSO_WIDTH +
    (quantidadeSubprocessos - 1) * SUBPROCESSO_GAP_X
  )
}

let proximoX = 0

const nodesGrupos = gruposProcesso.map((grupo) => {
  const quantidade = subprocessos.filter((subprocesso) => subprocesso.grupoId === grupo.id).length
  const largura = larguraGrupo(quantidade)

  const node = {
    id: grupo.id,
    data: { label: grupo.label },
    position: { x: proximoX, y: 0 },
    style: { backgroundColor: grupo.cor, width: `${largura}px`, height: `${GRUPO_HEIGHT}px` },
  }

  proximoX += largura + GRUPO_GAP_X

  return node
})

const nodesSubprocessos = subprocessos.map((subprocesso) => ({
  id: `${subprocesso.grupoId}-${slugify(subprocesso.label)}`,
  data: { label: subprocesso.label },
  position: {
    x: SUBPROCESSO_OFFSET_X + subprocesso.ordenacao * (SUBPROCESSO_WIDTH + SUBPROCESSO_GAP_X),
    y: GRUPO_OFFSET_TOP,
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
