// src/components/form-dinamico/snapshot-versoes/index.js
// Mapa de versões do shape do snapshot (ver FormularioDinamicoPorId.vue) para o componente
// que sabe renderizá-lo. Ao quebrar o shape (campo removido/renomeado/reestruturado), suba
// SNAPSHOT_VERSION_ATUAL, crie vN.vue com o novo shape e registre aqui — não altere um vN.vue
// já existente, pois registros antigos persistidos continuam apontando pra ele.
import V1 from './v1.vue'

export const SNAPSHOT_VERSION_ATUAL = 1

export const versoes = {
  1: V1,
}
