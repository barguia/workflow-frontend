<script setup>
import { computed, ref } from 'vue'
import { Handle, Panel, Position, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import MobilidadeAvancoTransitionEdge from './MobilidadeAvancoTransitionEdge.vue'

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

// Tarefas hardcoded — viram nodes "leaf", aninhadas no subprocesso via
// `parentNode`. Ainda sem relacionamento (edges) entre elas.
const tarefas = [
  { label: 'Registrar solicitação do projeto', ordenacao: 0, subprocessoLabel: 'Identificação da Demanda' },
  { label: 'Descrever problema/oportunidade', ordenacao: 1, subprocessoLabel: 'Identificação da Demanda' },
  { label: 'Definir objetivo inicial', ordenacao: 2, subprocessoLabel: 'Identificação da Demanda' },
  { label: 'Classificar tipo de projeto', ordenacao: 3, subprocessoLabel: 'Identificação da Demanda' },
  { label: 'Levantar requisitos iniciais', ordenacao: 0, subprocessoLabel: 'Análise de Viabilidade' },
  { label: 'Estimar esforço (alto nível)', ordenacao: 1, subprocessoLabel: 'Análise de Viabilidade' },
  { label: 'Analisar viabilidade técnica', ordenacao: 2, subprocessoLabel: 'Análise de Viabilidade' },
  { label: 'Analisar viabilidade financeira', ordenacao: 3, subprocessoLabel: 'Análise de Viabilidade' },
  { label: 'Identificar riscos iniciais', ordenacao: 4, subprocessoLabel: 'Análise de Viabilidade' },
  { label: 'Submeter proposta para aprovação', ordenacao: 0, subprocessoLabel: 'Aprovação do Projeto' },
  { label: 'Avaliação gerencial', ordenacao: 1, subprocessoLabel: 'Aprovação do Projeto' },
  { label: 'Aprovação ou rejeição', ordenacao: 2, subprocessoLabel: 'Aprovação do Projeto' },
  { label: 'Priorização no portfólio', ordenacao: 3, subprocessoLabel: 'Aprovação do Projeto' },
  { label: 'Definir escopo detalhado', ordenacao: 0, subprocessoLabel: 'Planejamento do Escopo' },
  { label: 'Criar EAP (estrutura analítica do projeto)', ordenacao: 1, subprocessoLabel: 'Planejamento do Escopo' },
  { label: 'Validar escopo com stakeholders', ordenacao: 2, subprocessoLabel: 'Planejamento do Escopo' },
  { label: 'Definir atividades', ordenacao: 0, subprocessoLabel: 'Planejamento de Cronograma' },
  { label: 'Sequenciar atividades', ordenacao: 1, subprocessoLabel: 'Planejamento de Cronograma' },
  { label: 'Estimar duração', ordenacao: 2, subprocessoLabel: 'Planejamento de Cronograma' },
  { label: 'Montar cronograma', ordenacao: 3, subprocessoLabel: 'Planejamento de Cronograma' },
  { label: 'Definir equipe', ordenacao: 0, subprocessoLabel: 'Planejamento de Recursos' },
  { label: 'Alocar responsáveis', ordenacao: 1, subprocessoLabel: 'Planejamento de Recursos' },
  { label: 'Planejar uso de ferramentas/infraestrutura', ordenacao: 2, subprocessoLabel: 'Planejamento de Recursos' },
  { label: 'Estimar custos', ordenacao: 0, subprocessoLabel: 'Planejamento de Custos' },
  { label: 'Definir orçamento', ordenacao: 1, subprocessoLabel: 'Planejamento de Custos' },
  { label: 'Aprovar orçamento', ordenacao: 2, subprocessoLabel: 'Planejamento de Custos' },
  { label: 'Identificar riscos', ordenacao: 0, subprocessoLabel: 'Planejamento de Riscos' },
  { label: 'Classificar riscos', ordenacao: 1, subprocessoLabel: 'Planejamento de Riscos' },
  { label: 'Definir plano de mitigação', ordenacao: 2, subprocessoLabel: 'Planejamento de Riscos' },
  { label: 'Iniciar atividade', ordenacao: 0, subprocessoLabel: 'Execução das Atividades' },
  { label: 'Executar tarefa', ordenacao: 1, subprocessoLabel: 'Execução das Atividades' },
  { label: 'Atualizar status', ordenacao: 2, subprocessoLabel: 'Execução das Atividades' },
  { label: 'Registrar impedimentos', ordenacao: 3, subprocessoLabel: 'Execução das Atividades' },
  { label: 'Atribuir tarefas', ordenacao: 0, subprocessoLabel: 'Gestão da Equipe' },
  { label: 'Monitorar produtividade', ordenacao: 1, subprocessoLabel: 'Gestão da Equipe' },
  { label: 'Resolver conflitos', ordenacao: 2, subprocessoLabel: 'Gestão da Equipe' },
  { label: 'Realizar reuniões de alinhamento', ordenacao: 3, subprocessoLabel: 'Gestão da Equipe' },
  { label: 'Enviar status report', ordenacao: 0, subprocessoLabel: 'Comunicação com Stakeholders' },
  { label: 'Realizar reuniões', ordenacao: 1, subprocessoLabel: 'Comunicação com Stakeholders' },
  { label: 'Registrar feedback', ordenacao: 2, subprocessoLabel: 'Comunicação com Stakeholders' },
  { label: 'Comparar planejado vs realizado', ordenacao: 0, subprocessoLabel: 'Controle de Prazo' },
  { label: 'Identificar atrasos', ordenacao: 1, subprocessoLabel: 'Controle de Prazo' },
  { label: 'Replanejar cronograma', ordenacao: 2, subprocessoLabel: 'Controle de Prazo' },
  { label: 'Monitorar gastos', ordenacao: 0, subprocessoLabel: 'Controle de Custos' },
  { label: 'Comparar com orçamento', ordenacao: 1, subprocessoLabel: 'Controle de Custos' },
  { label: 'Ajustar custos', ordenacao: 2, subprocessoLabel: 'Controle de Custos' },
  { label: 'Validar entregas', ordenacao: 0, subprocessoLabel: 'Controle de Qualidade' },
  { label: 'Executar testes', ordenacao: 1, subprocessoLabel: 'Controle de Qualidade' },
  { label: 'Registrar não conformidades', ordenacao: 2, subprocessoLabel: 'Controle de Qualidade' },
  { label: 'Solicitar mudança', ordenacao: 0, subprocessoLabel: 'Gestão de Mudanças' },
  { label: 'Avaliar impacto', ordenacao: 1, subprocessoLabel: 'Gestão de Mudanças' },
  { label: 'Aprovar/rejeitar mudança', ordenacao: 2, subprocessoLabel: 'Gestão de Mudanças' },
  { label: 'Atualizar planejamento', ordenacao: 3, subprocessoLabel: 'Gestão de Mudanças' },
  { label: 'Validar entregáveis', ordenacao: 0, subprocessoLabel: 'Entrega do Projeto' },
  { label: 'Obter aceite do cliente', ordenacao: 1, subprocessoLabel: 'Entrega do Projeto' },
  { label: 'Formalizar entrega', ordenacao: 2, subprocessoLabel: 'Entrega do Projeto' },
  { label: 'Consolidar documentação', ordenacao: 0, subprocessoLabel: 'Documentação Final' },
  { label: 'Registrar lições aprendidas', ordenacao: 1, subprocessoLabel: 'Documentação Final' },
  { label: 'Arquivar projeto', ordenacao: 2, subprocessoLabel: 'Documentação Final' },
  { label: 'Liberar equipe', ordenacao: 0, subprocessoLabel: 'Encerramento Administrativo' },
  { label: 'Encerrar contratos', ordenacao: 1, subprocessoLabel: 'Encerramento Administrativo' },
  { label: 'Finalizar custos', ordenacao: 2, subprocessoLabel: 'Encerramento Administrativo' },
]

const GRUPO_OFFSET_TOP = 50
const GRUPO_OFFSET_BOTTOM = 20
const GRUPO_GAP_X = 60
const SUBPROCESSO_OFFSET_X = 20
const SUBPROCESSO_GAP_X = 16
const SUBPROCESSO_OFFSET_TOP = 60
const SUBPROCESSO_OFFSET_BOTTOM = 10
const TAREFA_WIDTH = 140
const TAREFA_HEIGHT = 46
const TAREFA_OFFSET_X = 10
const TAREFA_GAP_Y = 32

// Subprocessos continuam lado a lado (largura fixa), mas as tarefas agora
// ficam empilhadas na vertical dentro do subprocesso — então é a largura do
// subprocesso que fica fixa e a altura que cresce com a quantidade de tarefas.
const SUBPROCESSO_WIDTH = TAREFA_OFFSET_X * 2 + TAREFA_WIDTH

function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function alturaSubprocesso(quantidadeTarefas) {
  return (
    SUBPROCESSO_OFFSET_TOP +
    quantidadeTarefas * TAREFA_HEIGHT +
    Math.max(0, quantidadeTarefas - 1) * TAREFA_GAP_Y +
    SUBPROCESSO_OFFSET_BOTTOM
  )
}

// Enriquece cada subprocesso com id, tarefas ordenadas e altura calculada a
// partir da quantidade de tarefas — necessário antes de posicionar os grupos.
const tarefasPorSubprocesso = new Map()
for (const tarefa of tarefas) {
  const lista = tarefasPorSubprocesso.get(tarefa.subprocessoLabel) || []
  lista.push(tarefa)
  tarefasPorSubprocesso.set(tarefa.subprocessoLabel, lista)
}

for (const subprocesso of subprocessos) {
  subprocesso.id = `${subprocesso.grupoId}-${slugify(subprocesso.label)}`
  subprocesso.tarefas = (tarefasPorSubprocesso.get(subprocesso.label) || [])
    .slice()
    .sort((a, b) => a.ordenacao - b.ordenacao)
  subprocesso.altura = alturaSubprocesso(subprocesso.tarefas.length)
}

let proximoXGrupo = 0

const nodesGrupos = gruposProcesso.map((grupo) => {
  const subprocessosDoGrupo = subprocessos
    .filter((subprocesso) => subprocesso.grupoId === grupo.id)
    .sort((a, b) => a.ordenacao - b.ordenacao)

  const largura =
    SUBPROCESSO_OFFSET_X * 2 +
    subprocessosDoGrupo.length * SUBPROCESSO_WIDTH +
    Math.max(0, subprocessosDoGrupo.length - 1) * SUBPROCESSO_GAP_X

  const altura = GRUPO_OFFSET_TOP + Math.max(...subprocessosDoGrupo.map((s) => s.altura)) + GRUPO_OFFSET_BOTTOM

  let proximoXSubprocesso = SUBPROCESSO_OFFSET_X
  for (const subprocesso of subprocessosDoGrupo) {
    subprocesso.position = { x: proximoXSubprocesso, y: GRUPO_OFFSET_TOP }
    proximoXSubprocesso += SUBPROCESSO_WIDTH + SUBPROCESSO_GAP_X
  }

  const node = {
    id: grupo.id,
    data: { label: grupo.label },
    position: { x: proximoXGrupo, y: 0 },
    style: { backgroundColor: grupo.cor, width: `${largura}px`, height: `${altura}px` },
  }

  proximoXGrupo += largura + GRUPO_GAP_X

  return node
})

const nodesSubprocessos = subprocessos.map((subprocesso) => ({
  id: subprocesso.id,
  data: { label: subprocesso.label },
  position: subprocesso.position,
  parentNode: subprocesso.grupoId,
  extent: 'parent',
  style: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(44, 62, 80, 0.3)',
    width: `${SUBPROCESSO_WIDTH}px`,
    height: `${subprocesso.altura}px`,
    padding: '8px 10px',
    fontSize: '11px',
    lineHeight: '1.25',
  },
}))

// Guarda o id de cada node de tarefa por label, para montar os
// relacionamentos (edges) a partir dos nomes das tarefas.
const tarefaIdPorLabel = new Map()

const nodesTarefas = subprocessos.flatMap((subprocesso) =>
  subprocesso.tarefas.map((tarefa) => {
    const id = `${subprocesso.id}-${slugify(tarefa.label)}`
    tarefaIdPorLabel.set(tarefa.label, id)

    return {
      id,
      type: 'tarefa',
      data: { label: tarefa.label },
      position: {
        x: TAREFA_OFFSET_X,
        y: SUBPROCESSO_OFFSET_TOP + tarefa.ordenacao * (TAREFA_HEIGHT + TAREFA_GAP_Y),
      },
      parentNode: subprocesso.id,
      extent: 'parent',
      style: {
        backgroundColor: 'rgba(226, 232, 240, 0.9)',
        border: '1px solid rgba(44, 62, 80, 0.25)',
        width: `${TAREFA_WIDTH}px`,
        height: `${TAREFA_HEIGHT}px`,
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        lineHeight: '1.2',
      },
    }
  }),
)

const nodes = ref([...nodesGrupos, ...nodesSubprocessos, ...nodesTarefas])

// Relacionamentos hardcoded entre tarefas — ainda de forma simples, sem
// curvatura customizada, só ligando origem e destino pelo label.
const relacionamentosAvanco = [
  { origem: 'Registrar solicitação do projeto', destino: 'Descrever problema/oportunidade' },
  { origem: 'Descrever problema/oportunidade', destino: 'Definir objetivo inicial' },
  { origem: 'Definir objetivo inicial', destino: 'Classificar tipo de projeto' },
  { origem: 'Classificar tipo de projeto', destino: 'Levantar requisitos iniciais' },
  { origem: 'Levantar requisitos iniciais', destino: 'Estimar esforço (alto nível)' },
  { origem: 'Estimar esforço (alto nível)', destino: 'Analisar viabilidade técnica' },
  { origem: 'Analisar viabilidade técnica', destino: 'Analisar viabilidade financeira' },
  { origem: 'Analisar viabilidade financeira', destino: 'Identificar riscos iniciais' },
  { origem: 'Identificar riscos iniciais', destino: 'Submeter proposta para aprovação' },
  { origem: 'Submeter proposta para aprovação', destino: 'Avaliação gerencial' },
  { origem: 'Avaliação gerencial', destino: 'Aprovação ou rejeição' },
  { origem: 'Aprovação ou rejeição', destino: 'Priorização no portfólio' },
  { origem: 'Definir escopo detalhado', destino: 'Criar EAP (estrutura analítica do projeto)' },
  { origem: 'Criar EAP (estrutura analítica do projeto)', destino: 'Validar escopo com stakeholders' },
  { origem: 'Validar escopo com stakeholders', destino: 'Definir atividades' },
  { origem: 'Definir atividades', destino: 'Sequenciar atividades' },
  { origem: 'Sequenciar atividades', destino: 'Estimar duração' },
  { origem: 'Estimar duração', destino: 'Montar cronograma' },
  { origem: 'Montar cronograma', destino: 'Definir equipe' },
  { origem: 'Definir equipe', destino: 'Alocar responsáveis' },
  { origem: 'Alocar responsáveis', destino: 'Planejar uso de ferramentas/infraestrutura' },
  { origem: 'Planejar uso de ferramentas/infraestrutura', destino: 'Estimar custos' },
  { origem: 'Estimar custos', destino: 'Definir orçamento' },
  { origem: 'Definir orçamento', destino: 'Aprovar orçamento' },
  { origem: 'Aprovar orçamento', destino: 'Identificar riscos' },
  { origem: 'Identificar riscos', destino: 'Classificar riscos' },
  { origem: 'Classificar riscos', destino: 'Definir plano de mitigação' },
  { origem: 'Iniciar atividade', destino: 'Executar tarefa' },
  { origem: 'Executar tarefa', destino: 'Atualizar status' },
  { origem: 'Atualizar status', destino: 'Registrar impedimentos' },
  { origem: 'Registrar impedimentos', destino: 'Atribuir tarefas' },
  { origem: 'Atribuir tarefas', destino: 'Monitorar produtividade' },
  { origem: 'Monitorar produtividade', destino: 'Resolver conflitos' },
  { origem: 'Resolver conflitos', destino: 'Realizar reuniões de alinhamento' },
  { origem: 'Realizar reuniões de alinhamento', destino: 'Enviar status report' },
  { origem: 'Enviar status report', destino: 'Realizar reuniões' },
  { origem: 'Realizar reuniões', destino: 'Registrar feedback' },
  { origem: 'Comparar planejado vs realizado', destino: 'Identificar atrasos' },
  { origem: 'Identificar atrasos', destino: 'Replanejar cronograma' },
  { origem: 'Replanejar cronograma', destino: 'Monitorar gastos' },
  { origem: 'Monitorar gastos', destino: 'Comparar com orçamento' },
  { origem: 'Comparar com orçamento', destino: 'Ajustar custos' },
  { origem: 'Ajustar custos', destino: 'Validar entregas' },
  { origem: 'Validar entregas', destino: 'Executar testes' },
  { origem: 'Executar testes', destino: 'Registrar não conformidades' },
  { origem: 'Registrar não conformidades', destino: 'Solicitar mudança' },
  { origem: 'Solicitar mudança', destino: 'Avaliar impacto' },
  { origem: 'Avaliar impacto', destino: 'Aprovar/rejeitar mudança' },
  { origem: 'Aprovar/rejeitar mudança', destino: 'Atualizar planejamento' },
  { origem: 'Validar entregáveis', destino: 'Obter aceite do cliente' },
  { origem: 'Obter aceite do cliente', destino: 'Formalizar entrega' },
  { origem: 'Formalizar entrega', destino: 'Consolidar documentação' },
  { origem: 'Consolidar documentação', destino: 'Registrar lições aprendidas' },
  { origem: 'Registrar lições aprendidas', destino: 'Arquivar projeto' },
  { origem: 'Arquivar projeto', destino: 'Liberar equipe' },
  { origem: 'Liberar equipe', destino: 'Encerrar contratos' },
  { origem: 'Encerrar contratos', destino: 'Finalizar custos' },
]

// Relacionamentos de devolução — mesmo formato do avanço.
const relacionamentosDevolucao = [
  { origem: 'Descrever problema/oportunidade', destino: 'Registrar solicitação do projeto' },
  { origem: 'Definir objetivo inicial', destino: 'Descrever problema/oportunidade' },
  { origem: 'Classificar tipo de projeto', destino: 'Definir objetivo inicial' },
  { origem: 'Levantar requisitos iniciais', destino: 'Classificar tipo de projeto' },
  { origem: 'Estimar esforço (alto nível)', destino: 'Levantar requisitos iniciais' },
  { origem: 'Analisar viabilidade técnica', destino: 'Estimar esforço (alto nível)' },
  { origem: 'Analisar viabilidade financeira', destino: 'Analisar viabilidade técnica' },
  { origem: 'Identificar riscos iniciais', destino: 'Analisar viabilidade financeira' },
  { origem: 'Submeter proposta para aprovação', destino: 'Identificar riscos iniciais' },
  { origem: 'Avaliação gerencial', destino: 'Submeter proposta para aprovação' },
  { origem: 'Aprovação ou rejeição', destino: 'Avaliação gerencial' },
  { origem: 'Priorização no portfólio', destino: 'Aprovação ou rejeição' },
  { origem: 'Criar EAP (estrutura analítica do projeto)', destino: 'Definir escopo detalhado' },
  { origem: 'Validar escopo com stakeholders', destino: 'Criar EAP (estrutura analítica do projeto)' },
  { origem: 'Definir atividades', destino: 'Validar escopo com stakeholders' },
  { origem: 'Sequenciar atividades', destino: 'Definir atividades' },
  { origem: 'Estimar duração', destino: 'Sequenciar atividades' },
  { origem: 'Montar cronograma', destino: 'Estimar duração' },
  { origem: 'Definir equipe', destino: 'Montar cronograma' },
  { origem: 'Alocar responsáveis', destino: 'Definir equipe' },
  { origem: 'Planejar uso de ferramentas/infraestrutura', destino: 'Alocar responsáveis' },
  { origem: 'Estimar custos', destino: 'Planejar uso de ferramentas/infraestrutura' },
  { origem: 'Definir orçamento', destino: 'Estimar custos' },
  { origem: 'Aprovar orçamento', destino: 'Definir orçamento' },
  { origem: 'Identificar riscos', destino: 'Aprovar orçamento' },
  { origem: 'Classificar riscos', destino: 'Identificar riscos' },
  { origem: 'Definir plano de mitigação', destino: 'Classificar riscos' },
  { origem: 'Executar tarefa', destino: 'Iniciar atividade' },
  { origem: 'Atualizar status', destino: 'Executar tarefa' },
  { origem: 'Registrar impedimentos', destino: 'Atualizar status' },
  { origem: 'Atribuir tarefas', destino: 'Registrar impedimentos' },
  { origem: 'Monitorar produtividade', destino: 'Atribuir tarefas' },
  { origem: 'Resolver conflitos', destino: 'Monitorar produtividade' },
  { origem: 'Realizar reuniões de alinhamento', destino: 'Resolver conflitos' },
  { origem: 'Enviar status report', destino: 'Realizar reuniões de alinhamento' },
  { origem: 'Realizar reuniões', destino: 'Enviar status report' },
  { origem: 'Registrar feedback', destino: 'Realizar reuniões' },
  { origem: 'Identificar atrasos', destino: 'Comparar planejado vs realizado' },
  { origem: 'Replanejar cronograma', destino: 'Identificar atrasos' },
  { origem: 'Monitorar gastos', destino: 'Replanejar cronograma' },
  { origem: 'Comparar com orçamento', destino: 'Monitorar gastos' },
  { origem: 'Ajustar custos', destino: 'Comparar com orçamento' },
  { origem: 'Validar entregas', destino: 'Ajustar custos' },
  { origem: 'Executar testes', destino: 'Validar entregas' },
  { origem: 'Registrar não conformidades', destino: 'Executar testes' },
  { origem: 'Solicitar mudança', destino: 'Registrar não conformidades' },
  { origem: 'Avaliar impacto', destino: 'Solicitar mudança' },
  { origem: 'Aprovar/rejeitar mudança', destino: 'Avaliar impacto' },
  { origem: 'Atualizar planejamento', destino: 'Aprovar/rejeitar mudança' },
  { origem: 'Obter aceite do cliente', destino: 'Validar entregáveis' },
  { origem: 'Formalizar entrega', destino: 'Obter aceite do cliente' },
  { origem: 'Consolidar documentação', destino: 'Formalizar entrega' },
  { origem: 'Registrar lições aprendidas', destino: 'Consolidar documentação' },
  { origem: 'Arquivar projeto', destino: 'Registrar lições aprendidas' },
  { origem: 'Liberar equipe', destino: 'Arquivar projeto' },
  { origem: 'Encerrar contratos', destino: 'Liberar equipe' },
  { origem: 'Finalizar custos', destino: 'Encerrar contratos' },
]

// Todo relacionamento tem animação (igual ao edge 1-2 do exemplo do Vue Flow).
// O que muda por tipo é a cor da linha (devolução fica vermelha, para indicar
// que é um retorno/algo negativo) e o par de handles usado no node "tarefa":
// avanço sai/entra por cima/baixo, devolução sai/entra pela lateral — assim
// as duas direções não se sobrepõem visualmente.
const TIPO_AVANCO = 'avanco'
const TIPO_DEVOLUCAO = 'devolucao'

const CORES_RELACIONAMENTO = {
  [TIPO_AVANCO]: undefined,
  [TIPO_DEVOLUCAO]: '#EF4444',
}

const HANDLES_RELACIONAMENTO = {
  [TIPO_AVANCO]: { sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  [TIPO_DEVOLUCAO]: { sourceHandle: 'left-source', targetHandle: 'right-target' },
}

const tipoItems = [
  { text: 'Avanço', value: TIPO_AVANCO },
  { text: 'Devolução', value: TIPO_DEVOLUCAO },
]
const tiposVisiveis = ref([TIPO_AVANCO, TIPO_DEVOLUCAO])

// Movimentação manual dos nodes vem desabilitada por padrão, já que o layout
// inteiro é calculado — o usuário liga quando quiser reorganizar na mão.
const movimentacaoHabilitada = ref(false)

const relacionamentos = [
  ...relacionamentosAvanco.map((relacionamento) => ({ ...relacionamento, tipo: TIPO_AVANCO })),
  ...relacionamentosDevolucao.map((relacionamento) => ({ ...relacionamento, tipo: TIPO_DEVOLUCAO })),
]

const edgesBase = ref(
  relacionamentos.map((relacionamento, indice) => {
    const cor = CORES_RELACIONAMENTO[relacionamento.tipo]
    const handles = HANDLES_RELACIONAMENTO[relacionamento.tipo]
    const ehAvanco = relacionamento.tipo === TIPO_AVANCO

    return {
      id: `e${indice}`,
      source: tarefaIdPorLabel.get(relacionamento.origem),
      target: tarefaIdPorLabel.get(relacionamento.destino),
      ...handles,
      // Só o avanço usa o edge custom com o "trenzinho" — a devolução, por
      // enquanto, fica só com a linha animada padrão.
      ...(ehAvanco ? { type: 'avanco-transition' } : {}),
      animated: true,
      data: { tipo: relacionamento.tipo },
      ...(cor ? { style: { stroke: cor } } : {}),
    }
  }),
)

const edges = computed(() => edgesBase.value.filter((edge) => tiposVisiveis.value.includes(edge.data.tipo)))

// Percurso do "duplo clique": anda a cadeia de avanço inteira, sempre da
// primeira tarefa até a última — não importa em qual node do meio da cadeia
// o usuário dá o duplo clique.
const proximoAvancoPorNode = new Map()
const anteriorAvancoPorNode = new Map()
const avancoEdgeIdPorPar = new Map()

for (const edge of edgesBase.value) {
  if (edge.data.tipo !== TIPO_AVANCO) continue
  proximoAvancoPorNode.set(edge.source, edge.target)
  anteriorAvancoPorNode.set(edge.target, edge.source)
  avancoEdgeIdPorPar.set(`${edge.source}->${edge.target}`, edge.id)
}

function encontrarInicioCadeiaAvanco(nodeId) {
  let atual = nodeId
  while (anteriorAvancoPorNode.has(atual)) {
    atual = anteriorAvancoPorNode.get(atual)
  }
  return atual
}

function montarCadeiaAvancoEdgeIds(nodeInicial) {
  const idsCadeia = []
  let atual = nodeInicial

  while (proximoAvancoPorNode.has(atual)) {
    const proximo = proximoAvancoPorNode.get(atual)
    idsCadeia.push(avancoEdgeIdPorPar.get(`${atual}->${proximo}`))
    atual = proximo
  }

  return idsCadeia
}

const edgeAtivaId = ref(null)
const filaAnimacaoAvanco = ref([])

function avancarFilaAnimacaoAvanco() {
  edgeAtivaId.value = filaAnimacaoAvanco.value.shift() ?? null
}

function iniciarAnimacaoCadeiaAvanco(nodeId) {
  // Enquanto uma cadeia está tocando, ignora novos duplos cliques.
  if (edgeAtivaId.value) return

  const inicio = encontrarInicioCadeiaAvanco(nodeId)
  const cadeia = montarCadeiaAvancoEdgeIds(inicio)
  if (cadeia.length === 0) return

  filaAnimacaoAvanco.value = cadeia
  avancarFilaAnimacaoAvanco()
}

const { onNodeDoubleClick } = useVueFlow()

onNodeDoubleClick(({ node }) => {
  iniciarAnimacaoCadeiaAvanco(node.id)
})
</script>

<template>
  <div class="grupos-processo-flow">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :nodes-draggable="movimentacaoHabilitada"
      fit-view-on-init
      elevate-edges-on-select
    >
      <template #node-tarefa="{ data }">
        <Handle
          id="top-target"
          type="target"
          :position="Position.Top"
        />
        <Handle
          id="top-source"
          type="source"
          :position="Position.Top"
        />
        <Handle
          id="bottom-target"
          type="target"
          :position="Position.Bottom"
        />
        <Handle
          id="bottom-source"
          type="source"
          :position="Position.Bottom"
        />
        <Handle
          id="left-target"
          type="target"
          :position="Position.Left"
        />
        <Handle
          id="left-source"
          type="source"
          :position="Position.Left"
        />
        <Handle
          id="right-target"
          type="target"
          :position="Position.Right"
        />
        <Handle
          id="right-source"
          type="source"
          :position="Position.Right"
        />
        {{ data.label }}
      </template>

      <template #edge-avanco-transition="edgeProps">
        <MobilidadeAvancoTransitionEdge
          v-bind="edgeProps"
          :tocando="edgeAtivaId === edgeProps.id"
          @concluido="avancarFilaAnimacaoAvanco"
        />
      </template>

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

.grupos-processo-flow :deep(.vue-flow__node-tarefa .vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}

.filtro-panel {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-transform: none;
  color: #2c3e50;
}
</style>
