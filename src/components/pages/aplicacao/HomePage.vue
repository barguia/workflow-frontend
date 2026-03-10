<template>
  <ContainerComponent fluid class="fill-height pa-0">
    <RowComponent no-gutters class="fill-height">
      <!-- Seção Principal de Boas-vindas -->
      <ColComponent cols="12" class="d-flex align-center justify-center bg-primary">
        <div class="text-center text-white px-4">
          <h1 class="text-h3 font-weight-bold mb-4">
            Bem-vindo ao Workflow
          </h1>
          <p class="text-h6 mb-6 opacity-90">
            O sistema completo para gestão inteligente de fluxos de trabalho
          </p>
          <ButtonComponent size="large" color="white" variant="flat" class="text-primary">
            Explorar Recursos
          </ButtonComponent>
        </div>
      </ColComponent>

      <!-- Seção de Recursos -->
      <ColComponent cols="12" class="py-16">
        <ContainerComponent>
          <RowComponent justify="center">
            <ColComponent cols="12" class="text-center mb-12">
              <h2 class="text-h4 font-weight-bold text-primary mb-4">
                Recursos que impulsionam sua produtividade
              </h2>
              <p class="text-body-1 text-medium-emphasis max-w-800 mx-auto">
                Gerencie processos complexos com simplicidade e acompanhe tudo em tempo real
              </p>
            </ColComponent>

            <!-- Cartões de Recursos -->
            <ColComponent cols="12" md="4" class="d-flex">
              <CardComponent elevation="4" class="pa-6 flex-grow-1 text-center">
                <IconComponent size="48" color="primary" class="mb-4">
                  mdi-chart-timeline-variant
                </IconComponent>
                <h3 class="text-h5 font-weight-bold mb-3">Dashboards Interativos</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Visualize métricas em tempo real com gráficos dinâmicos e indicadores personalizáveis
                </p>
              </CardComponent>
            </ColComponent>

            <ColComponent cols="12" md="4" class="d-flex">
              <CardComponent elevation="4" class="pa-6 flex-grow-1 text-center">
                <IconComponent size="48" color="primary" class="mb-4">
                  mdi-form-select
                </IconComponent>
                <h3 class="text-h5 font-weight-bold mb-3">Formulários Dinâmicos</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Crie formulários inteligentes que se adaptam conforme as respostas do usuário
                </p>
              </CardComponent>
            </ColComponent>

            <ColComponent cols="12" md="4" class="d-flex">
              <CardComponent elevation="4" class="pa-6 flex-grow-1 text-center">
                <IconComponent size="48" color="primary" class="mb-4">
                  mdi-playlist-check
                </IconComponent>
                <h3 class="text-h5 font-weight-bold mb-3">Filas de Trabalho</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Organize tarefas em filas prioritárias com distribuição automática entre equipes
                </p>
              </CardComponent>
            </ColComponent>
          </RowComponent>
        </ContainerComponent>
      </ColComponent>

      <!-- Seção de Destaque -->
      <ColComponent cols="12" class="py-16" style="background: rgb(var(--v-theme-background))">
        <ContainerComponent>
          <RowComponent align="center">
            <ColComponent cols="12" md="6">
              <h2 class="text-h4 font-weight-bold mb-4">
                Gestão Completa de Processos
              </h2>
              <p class="text-body-1 mb-6 text-medium-emphasis">
                Segmentação inteligente em <strong>tarefas</strong> e <strong>processos</strong> permite
                controle granular sobre cada etapa do fluxo. Defina responsáveis, prazos e dependências
                com apenas alguns cliques.
              </p>
              <ListComponent class="bg-transparent">
                <ListItemComponent>
                  <v-list-item-title class="d-flex align-center">
                    <IconComponent color="success" class="mr-2">mdi-check-circle</IconComponent>
                    Mapeamento visual de fluxos
                  </v-list-item-title>
                </ListItemComponent>
                <ListItemComponent>
                  <v-list-item-title class="d-flex align-center">
                    <IconComponent color="success" class="mr-2">mdi-check-circle</IconComponent>
                    Automação de aprovações
                  </v-list-item-title>
                </ListItemComponent>
                <ListItemComponent>
                  <v-list-item-title class="d-flex align-center">
                    <IconComponent color="success" class="mr-2">mdi-check-circle</IconComponent>
                    Rastreamento em tempo real
                  </v-list-item-title>
                </ListItemComponent>
              </ListComponent>
            </ColComponent>
            <ColComponent cols="12" md="6" class="text-center">
              <v-responsive class="mx-auto" max-width="500">
                <div class="placeholder-image bg-grey-lighten-2 rounded-xl d-flex align-center justify-center fill-height">
                  <IconComponent size="80" color="grey-darken-1">mdi-image-outline</IconComponent>
                </div>
              </v-responsive>
            </ColComponent>
          </RowComponent>
        </ContainerComponent>
      </ColComponent>
    </RowComponent>
  </ContainerComponent>
</template>

<script setup>
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import ListComponent from '@/components/comuns/lists/ListComponent.vue'
import ListItemComponent from '@/components/comuns/lists/ListItemComponent.vue'
</script>

<style scoped>
.max-w-800 {
  max-width: 800px;
}
.placeholder-image {
  height: 300px;
}
</style>
