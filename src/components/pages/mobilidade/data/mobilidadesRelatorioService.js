import { useCrud } from '@/services/useCrud.js'

export const MOBILIDADE_TIPO = {
  AVANCO: 1,
  DEVOLUCAO: 2,
}

const ROTA_MOBILIDADES_RELATORIO = 'wf/mobilidades-relatorio'

// Cada registro do relatório já traz a mobilidade (origem → destino) e o
// nome/processo/macroprocesso de ambas as tarefas — diferente do dataset
// estático usado pelos exemplos, aqui não há cross join a deduplicar. Uma
// mesma tarefa aparece em vários registros (ora como origem, ora como
// destino); tarefasPorId garante uma entrada única por ctrl_tarefa_id.
function normalizarRegistros(registros) {
  const tarefasPorId = new Map()
  const mobilidades = []

  registros.forEach((registro, indice) => {
    const origemId = registro.ctrl_origem_tarefa_id
    const destinoId = registro.ctrl_destino_tarefa_id

    if (!tarefasPorId.has(origemId)) {
      tarefasPorId.set(origemId, {
        id: origemId,
        tarefa: registro.tarefa_origem,
        processo: registro.processo_origem,
        macroprocesso: registro.macroprocesso_origem,
      })
    }
    if (!tarefasPorId.has(destinoId)) {
      tarefasPorId.set(destinoId, {
        id: destinoId,
        tarefa: registro.tarefa_destino,
        processo: registro.processo_destino,
        macroprocesso: registro.macroprocesso_destino,
      })
    }

    mobilidades.push({
      id: indice + 1,
      origemId,
      destinoId,
      tipoId: registro.ctrl_mobilidade_tipo_id,
    })
  })

  return {
    tarefas: [...tarefasPorId.values()],
    mobilidades,
  }
}

// Composable compartilhado pelos dashboards de mobilidade (não usado pelos
// exemplos, que continuam com o dataset estático em ./mobilidadesData.js e
// ./mobilidadesNomeadasData.js). Requer usuário autenticado — o token é
// injetado automaticamente pelo interceptor do api.js; sem sessão válida a
// API responde 401 e o guard global de rotas redireciona para /login.
export function useMobilidadesRelatorio() {
  const { index } = useCrud(ROTA_MOBILIDADES_RELATORIO)

  async function buscarMobilidades() {
    const registros = await index()
    return normalizarRegistros(registros ?? [])
  }

  return { buscarMobilidades }
}
