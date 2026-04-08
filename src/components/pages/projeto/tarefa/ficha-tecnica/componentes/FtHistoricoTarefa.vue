<template>
  <div>
    <div class="d-flex align-center gap-3 mb-3">
      <div class="text-subtitle-1 font-weight-bold">Histórico de Tratamentos</div>
      <SpacerComponent />
      <v-switch
        v-model="exibirSistemicos"
        label="Exibir automáticos"
        density="compact"
        hide-details
        color="primary"
        class="flex-grow-0"
        data-testid="ft-historico-switch-sistemicos"
      />
      <ButtonComponent size="small" variant="text" color="primary" :loading="carregando" @click="$emit('atualizar')" data-testid="ft-historico-btn-atualizar">
        <IconComponent start>mdi-refresh</IconComponent>
        Atualizar
      </ButtonComponent>
    </div>

    <CardComponent rounded="xl" variant="elevated">

      <!-- Toolbar -->
      <div class="table-toolbar pa-4 d-flex align-center ga-3">
        <span class="text-subtitle-2 font-weight-semibold">
          Tratamentos
          <ChipComponent size="x-small" color="primary" class="ml-2">{{ itensFiltrados.length }}</ChipComponent>
        </span>
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="d-flex justify-center py-10">
        <v-progress-circular indeterminate color="primary" size="36" />
      </div>

      <!-- Vazio -->
      <div v-else-if="itensFiltrados.length === 0" class="py-10 text-center text-medium-emphasis">
        <IconComponent size="40" class="mb-2">mdi-clipboard-text-outline</IconComponent>
        <div>Nenhum tratamento registrado.</div>
      </div>

      <!-- Timeline -->
      <v-timeline
        v-else
        side="end"
        align="start"
        density="compact"
        class="px-4 py-4"
      >
        <v-timeline-item
          v-for="item in itensFiltrados"
          :key="item.id"
          :dot-color="corTratamento(item.tratamento)"
          size="small"
        >
          <!-- Tratamento sistemico: apenas data de finalização, compacto -->
          <template v-if="item.sistemico">
            <div class="d-flex align-center gap-2 py-1">
              <ChipComponent
                size="x-small"
                :color="corTratamento(item.tratamento)"
                variant="tonal"
              >
                {{ item.tratamento }}
              </ChipComponent>
              <span class="text-caption text-medium-emphasis">{{ item.tarefa_origem }}</span>
              <SpacerComponent />
              <span class="text-caption text-medium-emphasis">{{ formatarDataHora(item.finalized_at) }}</span>
            </div>
          </template>

          <!-- Tratamento manual: inicio + fim, descrição -->
          <template v-else>
            <div class="mb-1 d-flex align-center gap-2 flex-wrap">
              <ChipComponent
                size="small"
                :color="corTratamento(item.tratamento)"
                variant="tonal"
                class="font-weight-medium"
              >
                {{ item.tratamento }}
              </ChipComponent>
              <ChipComponent
                v-if="item.tarefa_destino"
                size="small"
                color="primary"
                variant="tonal"
                class="font-weight-medium"
              >
                <span class="text-body-2 font-weight-medium" v-if="item.tarefa_destino">De: </span>
                <span class="text-body-2 font-weight-medium">{{ item.tarefa_origem }}</span>
              </ChipComponent>


              <ChipComponent
                v-if="item.tarefa_destino"
                size="small"
                color="success"
                variant="tonal"
                class="font-weight-medium"
              >
                <span class="text-body-1 font-weight-medium">Para:</span> {{ item.tarefa_destino }}
              </ChipComponent>
            </div>

            <div class="text-caption text-medium-emphasis mb-1">
              {{ item.usuario_tratamento }}
            </div>

            <div class="d-flex align-center gap-4 text-caption text-medium-emphasis mb-1">
              <span>
                <IconComponent size="13" class="mr-1">mdi-clock-start</IconComponent>
                Início: {{ formatarDataHora(item.created_at) }}
              </span>
              <span>
                <IconComponent size="13" class="mr-1">mdi-clock-end</IconComponent>
                Fim: {{ formatarDataHora(item.finalized_at) }}
              </span>
            </div>

            <div v-if="item.descricao" class="text-caption text-medium-emphasis fst-italic mt-1">
              <IconComponent size="13" class="mr-1">mdi-comment-text-outline</IconComponent>
              {{ item.descricao }}
            </div>
          </template>
        </v-timeline-item>
      </v-timeline>

    </CardComponent>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CardComponent    from '@/components/comuns/cards/CardComponent.vue'
import ButtonComponent  from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent    from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent  from '@/components/comuns/layout/SpacerComponent.vue'
import ChipComponent    from '@/components/comuns/chips/ChipComponent.vue'

const props = defineProps({
  tratamentos: { type: Array,   default: () => [] },
  carregando:  { type: Boolean, default: false },
})

defineEmits(['atualizar'])

const exibirSistemicos = ref(false)

const itensFiltrados = computed(() =>
  exibirSistemicos.value
    ? props.tratamentos
    : props.tratamentos.filter(t => !t.sistemico)
)

const COR_TRATAMENTO = {
  'Adotar':     'success',
  'Avançar':    'primary',
  'Retroceder': 'warning',
  'Abandonar':  'error',
}

function corTratamento(tratamento) {
  return COR_TRATAMENTO[tratamento] ?? 'secondary'
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
.table-toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
