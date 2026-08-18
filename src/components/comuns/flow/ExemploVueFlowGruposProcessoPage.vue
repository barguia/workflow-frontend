<script setup>
import { computed, ref } from 'vue'
import { Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import HierarquiaFlowComponent from '@/components/comuns/flow/HierarquiaFlowComponent.vue'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'

// Exemplo de uso do HierarquiaFlowComponent — grupos de processo do PMBOK
// (macroprocesso > processo > tarefa), com relacionamentos de avanço e
// devolução entre tarefas. Os dados abaixo ainda são hardcoded; a ideia é
// que no futuro venham de uma API (ver histórico de
// data/mobilidadesRelatorioService.js, removido nesta POC).

const hierarquias = [
  {
    nivel: 'macroprocesso',
    nivelPai: null,
    orientacao: 'horizontal',
    espacamentoIrmaos: 60,
    paddingConteudo: { topo: 50, fundo: 20, lateral: 20 },
  },
  {
    nivel: 'processo',
    nivelPai: 'macroprocesso',
    orientacao: 'horizontal',
    espacamentoIrmaos: 16,
    paddingConteudo: { topo: 60, fundo: 10, lateral: 10 },
  },
  {
    nivel: 'tarefa',
    nivelPai: 'processo',
    orientacao: 'vertical',
    espacamentoIrmaos: 32,
    largura: 130,
    altura: 46,
  },
]

const macroprocessos = [
  { id: 'iniciacao', label: 'Iniciação', cor: 'rgba(59, 130, 246, 0.5)' },
  { id: 'planejamento', label: 'Planejamento', cor: 'rgba(139, 92, 246, 0.5)' },
  { id: 'execucao', label: 'Execução', cor: 'rgba(16, 185, 129, 0.5)' },
  { id: 'monitoramento-controle', label: 'Monitoramento e Controle', cor: 'rgba(245, 158, 11, 0.5)' },
  { id: 'encerramento', label: 'Encerramento', cor: 'rgba(239, 68, 68, 0.5)' },
]

const processos = [
  { label: 'Identificação da Demanda', ordenacao: 0, macroprocessoId: 'iniciacao' },
  { label: 'Análise de Viabilidade', ordenacao: 1, macroprocessoId: 'iniciacao' },
  { label: 'Aprovação do Projeto', ordenacao: 2, macroprocessoId: 'iniciacao' },
  { label: 'Planejamento do Escopo', ordenacao: 0, macroprocessoId: 'planejamento' },
  { label: 'Planejamento de Cronograma', ordenacao: 1, macroprocessoId: 'planejamento' },
  { label: 'Planejamento de Recursos', ordenacao: 2, macroprocessoId: 'planejamento' },
  { label: 'Planejamento de Custos', ordenacao: 3, macroprocessoId: 'planejamento' },
  { label: 'Planejamento de Riscos', ordenacao: 4, macroprocessoId: 'planejamento' },
  { label: 'Execução das Atividades', ordenacao: 0, macroprocessoId: 'execucao' },
  { label: 'Gestão da Equipe', ordenacao: 1, macroprocessoId: 'execucao' },
  { label: 'Comunicação com Stakeholders', ordenacao: 2, macroprocessoId: 'execucao' },
  { label: 'Controle de Prazo', ordenacao: 0, macroprocessoId: 'monitoramento-controle' },
  { label: 'Controle de Custos', ordenacao: 1, macroprocessoId: 'monitoramento-controle' },
  { label: 'Controle de Qualidade', ordenacao: 2, macroprocessoId: 'monitoramento-controle' },
  { label: 'Gestão de Mudanças', ordenacao: 3, macroprocessoId: 'monitoramento-controle' },
  { label: 'Entrega do Projeto', ordenacao: 0, macroprocessoId: 'encerramento' },
  { label: 'Documentação Final', ordenacao: 1, macroprocessoId: 'encerramento' },
  { label: 'Encerramento Administrativo', ordenacao: 2, macroprocessoId: 'encerramento' },
]

const tarefas = [
  { label: 'Registrar solicitação do projeto', ordenacao: 0, processoLabel: 'Identificação da Demanda' },
  { label: 'Descrever problema/oportunidade', ordenacao: 1, processoLabel: 'Identificação da Demanda' },
  { label: 'Definir objetivo inicial', ordenacao: 2, processoLabel: 'Identificação da Demanda' },
  { label: 'Classificar tipo de projeto', ordenacao: 3, processoLabel: 'Identificação da Demanda' },
  { label: 'Levantar requisitos iniciais', ordenacao: 0, processoLabel: 'Análise de Viabilidade' },
  { label: 'Estimar esforço (alto nível)', ordenacao: 1, processoLabel: 'Análise de Viabilidade' },
  { label: 'Analisar viabilidade técnica', ordenacao: 2, processoLabel: 'Análise de Viabilidade' },
  { label: 'Analisar viabilidade financeira', ordenacao: 3, processoLabel: 'Análise de Viabilidade' },
  { label: 'Identificar riscos iniciais', ordenacao: 4, processoLabel: 'Análise de Viabilidade' },
  { label: 'Submeter proposta para aprovação', ordenacao: 0, processoLabel: 'Aprovação do Projeto' },
  { label: 'Avaliação gerencial', ordenacao: 1, processoLabel: 'Aprovação do Projeto' },
  { label: 'Aprovação ou rejeição', ordenacao: 2, processoLabel: 'Aprovação do Projeto' },
  { label: 'Priorização no portfólio', ordenacao: 3, processoLabel: 'Aprovação do Projeto' },
  { label: 'Definir escopo detalhado', ordenacao: 0, processoLabel: 'Planejamento do Escopo' },
  { label: 'Criar EAP (estrutura analítica do projeto)', ordenacao: 1, processoLabel: 'Planejamento do Escopo' },
  { label: 'Validar escopo com stakeholders', ordenacao: 2, processoLabel: 'Planejamento do Escopo' },
  { label: 'Definir atividades', ordenacao: 0, processoLabel: 'Planejamento de Cronograma' },
  { label: 'Sequenciar atividades', ordenacao: 1, processoLabel: 'Planejamento de Cronograma' },
  { label: 'Estimar duração', ordenacao: 2, processoLabel: 'Planejamento de Cronograma' },
  { label: 'Montar cronograma', ordenacao: 3, processoLabel: 'Planejamento de Cronograma' },
  { label: 'Definir equipe', ordenacao: 0, processoLabel: 'Planejamento de Recursos' },
  { label: 'Alocar responsáveis', ordenacao: 1, processoLabel: 'Planejamento de Recursos' },
  { label: 'Planejar uso de ferramentas/infraestrutura', ordenacao: 2, processoLabel: 'Planejamento de Recursos' },
  { label: 'Estimar custos', ordenacao: 0, processoLabel: 'Planejamento de Custos' },
  { label: 'Definir orçamento', ordenacao: 1, processoLabel: 'Planejamento de Custos' },
  { label: 'Aprovar orçamento', ordenacao: 2, processoLabel: 'Planejamento de Custos' },
  { label: 'Identificar riscos', ordenacao: 0, processoLabel: 'Planejamento de Riscos' },
  { label: 'Classificar riscos', ordenacao: 1, processoLabel: 'Planejamento de Riscos' },
  { label: 'Definir plano de mitigação', ordenacao: 2, processoLabel: 'Planejamento de Riscos' },
  { label: 'Iniciar atividade', ordenacao: 0, processoLabel: 'Execução das Atividades' },
  { label: 'Executar tarefa', ordenacao: 1, processoLabel: 'Execução das Atividades' },
  { label: 'Atualizar status', ordenacao: 2, processoLabel: 'Execução das Atividades' },
  { label: 'Registrar impedimentos', ordenacao: 3, processoLabel: 'Execução das Atividades' },
  { label: 'Atribuir tarefas', ordenacao: 0, processoLabel: 'Gestão da Equipe' },
  { label: 'Monitorar produtividade', ordenacao: 1, processoLabel: 'Gestão da Equipe' },
  { label: 'Resolver conflitos', ordenacao: 2, processoLabel: 'Gestão da Equipe' },
  { label: 'Realizar reuniões de alinhamento', ordenacao: 3, processoLabel: 'Gestão da Equipe' },
  { label: 'Enviar status report', ordenacao: 0, processoLabel: 'Comunicação com Stakeholders' },
  { label: 'Realizar reuniões', ordenacao: 1, processoLabel: 'Comunicação com Stakeholders' },
  { label: 'Registrar feedback', ordenacao: 2, processoLabel: 'Comunicação com Stakeholders' },
  { label: 'Comparar planejado vs realizado', ordenacao: 0, processoLabel: 'Controle de Prazo' },
  { label: 'Identificar atrasos', ordenacao: 1, processoLabel: 'Controle de Prazo' },
  { label: 'Replanejar cronograma', ordenacao: 2, processoLabel: 'Controle de Prazo' },
  { label: 'Monitorar gastos', ordenacao: 0, processoLabel: 'Controle de Custos' },
  { label: 'Comparar com orçamento', ordenacao: 1, processoLabel: 'Controle de Custos' },
  { label: 'Ajustar custos', ordenacao: 2, processoLabel: 'Controle de Custos' },
  { label: 'Validar entregas', ordenacao: 0, processoLabel: 'Controle de Qualidade' },
  { label: 'Executar testes', ordenacao: 1, processoLabel: 'Controle de Qualidade' },
  { label: 'Registrar não conformidades', ordenacao: 2, processoLabel: 'Controle de Qualidade' },
  { label: 'Solicitar mudança', ordenacao: 0, processoLabel: 'Gestão de Mudanças' },
  { label: 'Avaliar impacto', ordenacao: 1, processoLabel: 'Gestão de Mudanças' },
  { label: 'Aprovar/rejeitar mudança', ordenacao: 2, processoLabel: 'Gestão de Mudanças' },
  { label: 'Atualizar planejamento', ordenacao: 3, processoLabel: 'Gestão de Mudanças' },
  { label: 'Validar entregáveis', ordenacao: 0, processoLabel: 'Entrega do Projeto' },
  { label: 'Obter aceite do cliente', ordenacao: 1, processoLabel: 'Entrega do Projeto' },
  { label: 'Formalizar entrega', ordenacao: 2, processoLabel: 'Entrega do Projeto' },
  { label: 'Consolidar documentação', ordenacao: 0, processoLabel: 'Documentação Final' },
  { label: 'Registrar lições aprendidas', ordenacao: 1, processoLabel: 'Documentação Final' },
  { label: 'Arquivar projeto', ordenacao: 2, processoLabel: 'Documentação Final' },
  { label: 'Liberar equipe', ordenacao: 0, processoLabel: 'Encerramento Administrativo' },
  { label: 'Encerrar contratos', ordenacao: 1, processoLabel: 'Encerramento Administrativo' },
  { label: 'Finalizar custos', ordenacao: 2, processoLabel: 'Encerramento Administrativo' },
]

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
  { origem: 'Priorização no portfólio', destino: 'Definir escopo detalhado'},
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

function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Adapta o dataset hardcoded (rótulos) para o contrato genérico do
// HierarquiaFlowComponent (ids). Um adapter ligado a uma API real faria o
// mesmo, só que a partir de ids que já vêm do backend.
const processoIdPorLabel = new Map()
const tarefaIdPorLabel = new Map()

const nodes = [
  ...macroprocessos.map((macroprocesso) => ({
    id: macroprocesso.id,
    label: macroprocesso.label,
    nivel: 'macroprocesso',
    parentId: null,
    cor: macroprocesso.cor,
  })),
  ...processos.map((processo) => {
    const id = `${processo.macroprocessoId}-${slugify(processo.label)}`
    processoIdPorLabel.set(processo.label, id)

    return {
      id,
      label: processo.label,
      nivel: 'processo',
      parentId: processo.macroprocessoId,
      ordenacao: processo.ordenacao,
    }
  }),
  ...tarefas.map((tarefa) => {
    const processoId = processoIdPorLabel.get(tarefa.processoLabel)
    const id = `${processoId}-${slugify(tarefa.label)}`
    tarefaIdPorLabel.set(tarefa.label, id)

    return {
      id,
      label: tarefa.label,
      nivel: 'tarefa',
      parentId: processoId,
      ordenacao: tarefa.ordenacao,
    }
  }),
]

const TIPO_AVANCO = 'avanco'
const TIPO_DEVOLUCAO = 'devolucao'

const tiposRelacionamento = [
  { id: TIPO_AVANCO, label: 'Avanço', animado: true, handles: { source: 'bottom', target: 'top' } },
  { id: TIPO_DEVOLUCAO, label: 'Devolução', animado: true, cor: '#EF4444', handles: { source: 'left', target: 'right' } },
]

const relacionamentos = [
  ...relacionamentosAvanco.map((relacionamento) => ({
    origemId: tarefaIdPorLabel.get(relacionamento.origem),
    destinoId: tarefaIdPorLabel.get(relacionamento.destino),
    tipoId: TIPO_AVANCO,
  })),
  ...relacionamentosDevolucao.map((relacionamento) => ({
    origemId: tarefaIdPorLabel.get(relacionamento.origem),
    destinoId: tarefaIdPorLabel.get(relacionamento.destino),
    tipoId: TIPO_DEVOLUCAO,
  })),
]

const tipoItems = computed(() => tiposRelacionamento.map((tipo) => ({ text: tipo.label, value: tipo.id })))
const tiposVisiveis = ref(tiposRelacionamento.map((tipo) => tipo.id))

// Movimentação manual dos nodes vem desabilitada por padrão, já que o layout
// inteiro é calculado — o usuário liga quando quiser reorganizar na mão.
const movimentacaoHabilitada = ref(false)
</script>

<template>
  <div class="grupos-processo-flow">
    <HierarquiaFlowComponent
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

.filtro-panel {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-transform: none;
  color: #2c3e50;
}
</style>
