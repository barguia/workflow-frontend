<template>
  <div class="ft-cabecalho mb-6">
    <div class="d-flex align-center gap-2 mb-4 flex-wrap">
      <ButtonComponent
        icon="mdi-arrow-left"
        variant="text"
        size="small"
        data-testid="ft-cabecalho-btn-voltar"
        @click="$emit('voltar')"
      />
      <IconComponent
        color="primary"
        size="18"
      >
        mdi-clipboard-text-outline
      </IconComponent>
      <span class="text-overline text-medium-emphasis">Ficha Técnica da Tarefa</span>
      <SpacerComponent />
      <slot name="acoes" />
    </div>

    <!-- Workflow -->
    <div class="header-eyebrow mb-0">
      Workflow
    </div>
    <div class="header-workflow mb-4">
      {{ tarefa.workflow ?? '—' }}
    </div>

    <!-- Processo -->
    <div class="header-caminho mb-4">
      <div class="caminho-item">
        <div class="header-eyebrow">
          Processo
        </div>
        <div class="caminho-valor">
          {{ tarefa.processo ?? '—' }}
        </div>
      </div>
      <div
        v-if="tarefa.descricao_processo"
        class="caminho-item"
      >
        <div class="header-eyebrow">
          Fase
        </div>
        <div class="caminho-valor">
          {{ tarefa.descricao_processo }}
        </div>
      </div>
    </div>

    <!-- Tarefa atual em destaque -->
    <div class="tarefa-destaque d-flex align-center gap-3 flex-wrap">
      <div>
        <div class="header-eyebrow tarefa-eyebrow">
          Tarefa atual
        </div>
        <div class="tarefa-nome">
          {{ tarefa.tarefa }}
        </div>
      </div>
      <ChipComponent
        :color="tarefa.data_fim_tarefa ? 'success' : 'primary'"
        size="small"
        variant="tonal"
        label
      >
        {{ tarefa.status_tarefa ?? (tarefa.data_fim_tarefa ? 'Finalizado' : 'Em andamento') }}
      </ChipComponent>
      <ChipComponent
        v-if="tarefa.prioridade"
        :color="corPrioridade(tarefa.prioridade)"
        size="small"
        variant="tonal"
        label
      >
        {{ tarefa.prioridade }}
      </ChipComponent>
    </div>

    <!-- Meta: projeto, datas, aging -->
    <div class="text-caption text-medium-emphasis mt-3 d-flex align-center gap-3 flex-wrap">
      <span class="d-flex align-center gap-1">
        <IconComponent size="13">
          mdi-folder-outline
        </IconComponent>
        Projeto: {{ tarefa.projeto_nome ?? '—' }}
        <ButtonComponent
          v-if="tarefa.pco_projeto_id"
          icon="mdi-open-in-new"
          variant="text"
          size="x-small"
          color="primary"
          :href="`/ficha-tecnica/${tarefa.pco_projeto_id}`"
          target="_blank"
        />
      </span>
      <span class="text-medium-emphasis">·</span>
      <span>
        <IconComponent
          size="13"
          class="mr-1"
        >mdi-calendar-plus-outline</IconComponent>
        {{ formatarDataHora(tarefa.data_inicio_tarefa) }}
      </span>
      <template v-if="tarefa.data_fim_tarefa">
        <span class="text-medium-emphasis">·</span>
        <span class="text-success">
          <IconComponent
            size="13"
            class="mr-1"
          >mdi-calendar-check-outline</IconComponent>
          Fechado em {{ formatarDataHora(tarefa.data_fim_tarefa) }}
        </span>
      </template>
      <span class="text-medium-emphasis">·</span>
      <ChipComponent
        :color="agingColor(tarefa.aging_tarefa)"
        size="x-small"
        variant="tonal"
      >
        <IconComponent
          start
          size="12"
        >
          mdi-clock-outline
        </IconComponent>
        Aging: {{ tarefa.aging_tarefa ?? 0 }}d
      </ChipComponent>
    </div>
  </div>
</template>

<script setup>
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import ChipComponent from '@/components/comuns/chips/ChipComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'

defineProps({
  tarefa: { type: Object, required: true },
})

defineEmits(['voltar'])

function corPrioridade(prioridade) {
  const map = { alta: 'error', media: 'warning', média: 'warning', baixa: 'success' }
  return map[(prioridade ?? '').toLowerCase()] ?? 'default'
}

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
.header-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  margin-bottom: 2px;
}

.header-workflow {
  font-size: 1.15rem;
  font-weight: 600;
}

.header-caminho {
  display: flex;
  align-items: flex-end;
  gap: 24px;
}

.caminho-item {
  display: flex;
  flex-direction: column;
}

.caminho-valor {
  font-size: 0.95rem;
  font-weight: 600;
}

.tarefa-destaque {
  display: flex;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.tarefa-eyebrow {
  color: rgb(var(--v-theme-primary));
  opacity: 0.75;
}

.tarefa-nome {
  font-size: 1.6rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1.25;
}
</style>