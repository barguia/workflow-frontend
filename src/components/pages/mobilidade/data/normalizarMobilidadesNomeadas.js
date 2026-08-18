import { mobilidadesRaw, tarefasRaw, MOBILIDADE_TIPO } from './mobilidadesNomeadasData.js'

export function listarTarefas() {
  return tarefasRaw.map(([id, tarefa, processo, macroprocesso]) => ({
    id,
    tarefa,
    processo,
    macroprocesso,
  }))
}

export function listarMobilidades() {
  return mobilidadesRaw.map(([id, origemId, destinoId, tipoId]) => ({
    id,
    origemId,
    destinoId,
    tipoId,
  }))
}

export { MOBILIDADE_TIPO }
