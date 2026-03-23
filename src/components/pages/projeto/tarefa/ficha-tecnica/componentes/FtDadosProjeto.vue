<template>
  <CardComponent rounded="xl" variant="elevated" height="100%">
    <CardTextComponent class="pa-5">
      <div class="section-label mb-3">Dados do Projeto</div>
      <RowComponent dense>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Projeto</div>
          <div class="field-value d-flex align-center gap-1">
            {{ tarefa.nome ?? '—' }}
            <ButtonComponent
              v-if="tarefa.pco_projeto_id"
              icon="mdi-open-in-new"
              variant="text"
              size="x-small"
              color="primary"
              :href="`/ficha-tecnica/${tarefa.pco_projeto_id}`"
              target="_blank"
            />
          </div>
        </ColComponent>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Prioridade</div>
          <div class="field-value">
            <ChipComponent :color="corPrioridade(tarefa.prioridade)" size="small" variant="tonal" label>
              {{ tarefa.prioridade ?? '—' }}
            </ChipComponent>
          </div>
        </ColComponent>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Data de Início</div>
          <div class="field-value">{{ formatarData(tarefa.data_inicio) }}</div>
        </ColComponent>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Data de Término</div>
          <div class="field-value">{{ formatarData(tarefa.data_fim) }}</div>
        </ColComponent>
        <ColComponent v-if="tarefa.duracao" cols="12" sm="6">
          <div class="field-label">Duração</div>
          <div class="field-value">{{ tarefa.duracao }}</div>
        </ColComponent>
        <ColComponent v-if="tarefa.descricao_projeto" cols="12">
          <div class="field-label">Descrição</div>
          <div class="field-value">{{ tarefa.descricao_projeto }}</div>
        </ColComponent>
      </RowComponent>

      <DividerComponent class="my-4" />

      <div class="section-label mb-3">Workflow</div>
      <RowComponent dense>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Workflow</div>
          <div class="field-value">{{ tarefa.workflow ?? '—' }}</div>
        </ColComponent>
        <ColComponent v-if="tarefa.descricao_workflow" cols="12" sm="6">
          <div class="field-label">Descrição</div>
          <div class="field-value">{{ tarefa.descricao_workflow }}</div>
        </ColComponent>
        <ColComponent cols="12" sm="6">
          <div class="field-label">Aging do Workflow</div>
          <div class="field-value">
            <ChipComponent :color="agingColor(tarefa.aging_workflow)" size="small" variant="tonal">
              {{ tarefa.aging_workflow ?? 0 }} dia{{ tarefa.aging_workflow !== 1 ? 's' : '' }}
            </ChipComponent>
          </div>
        </ColComponent>
      </RowComponent>
    </CardTextComponent>
  </CardComponent>
</template>

<script setup>
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'

defineProps({
  tarefa: { type: Object, required: true },
})

function corPrioridade(prioridade) {
  const map = { alta: 'error', media: 'warning', média: 'warning', baixa: 'success' }
  return map[(prioridade ?? '').toLowerCase()] ?? 'default'
}

function agingColor(aging) {
  const v = aging ?? 0
  return v > 30 ? 'error' : v > 15 ? 'warning' : 'success'
}

function formatarData(val) {
  if (!val) return '—'
  const [y, m, d] = val.split('-')
  return `${d}/${m}/${y}`
}
</script>

<style scoped>
.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.55;
}
.field-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  margin-bottom: 2px;
}
.field-value {
  font-size: 0.925rem;
  font-weight: 500;
}
</style>
