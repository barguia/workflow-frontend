<template>
  <CardComponent
    rounded="xl"
    variant="elevated"
    height="100%"
  >
    <CardTextComponent class="pa-5">
      <div class="section-label mb-3">
        Detalhes da Tarefa
      </div>
      <RowComponent dense>
        <ColComponent
          v-if="tarefa.descricao_tarefa"
          cols="12"
        >
          <div class="field-label">
            Descrição
          </div>
          <div class="field-value">
            {{ tarefa.descricao_tarefa }}
          </div>
        </ColComponent>
        <ColComponent
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Responsável pelo Tratamento
          </div>
          <div class="field-value">
            {{ tarefa.user_tratamento ?? '—' }}
          </div>
        </ColComponent>
        <ColComponent
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Aging do Processo
          </div>
          <div class="field-value">
            <ChipComponent
              :color="agingColor(tarefa.aging_processo)"
              size="small"
              variant="tonal"
            >
              {{ tarefa.aging_processo ?? 0 }} dia{{ tarefa.aging_processo !== 1 ? 's' : '' }}
            </ChipComponent>
          </div>
        </ColComponent>
        <ColComponent
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Aging da Tarefa
          </div>
          <div class="field-value">
            <ChipComponent
              :color="agingColor(tarefa.aging_tarefa)"
              size="small"
              variant="tonal"
            >
              {{ tarefa.aging_tarefa ?? 0 }} dia{{ tarefa.aging_tarefa !== 1 ? 's' : '' }}
            </ChipComponent>
          </div>
        </ColComponent>
        <ColComponent
          v-if="tarefa.descricao_status_status"
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Descrição do Status
          </div>
          <div class="field-value">
            {{ tarefa.descricao_status_status }}
          </div>
        </ColComponent>
        <ColComponent
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Data de Cadastro
          </div>
          <div class="field-value">
            {{ formatarDataHora(tarefa.data_inicio_tarefa) }}
          </div>
        </ColComponent>
        <ColComponent
          cols="12"
          sm="6"
        >
          <div class="field-label">
            Fechado em
          </div>
          <div class="field-value">
            {{ tarefa.data_fim_tarefa ? formatarDataHora(tarefa.data_fim_tarefa) : '—' }}
          </div>
        </ColComponent>
      </RowComponent>
    </CardTextComponent>
  </CardComponent>
</template>

<script setup>
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'

defineProps({
  tarefa: { type: Object, required: true },
})

function agingColor(aging) {
  const v = aging ?? 0
  return v > 30 ? 'error' : v > 15 ? 'warning' : 'success'
}

function formatarDataHora(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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
