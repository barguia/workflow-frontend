<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Seção Principal de Boas-vindas -->
      <v-col cols="12" class="d-flex align-center justify-center bg-primary">
        <div class="text-center text-white px-4">
          <h1 class="text-h3 font-weight-bold mb-4">
            Bem-vindo ao Workflow
          </h1>
          <p class="text-h6 mb-6 opacity-90">
            O sistema completo para gestão inteligente de fluxos de trabalho
          </p>
          <v-btn size="large" color="white" variant="flat" class="text-primary">
            Explorar Recursos
          </v-btn>
        </div>
      </v-col>

      <!-- Seção de Recursos -->
      <v-col cols="12" class="py-16">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" class="text-center mb-12">
              <h2 class="text-h4 font-weight-bold text-primary mb-4">
                Recursos que impulsionam sua produtividade
              </h2>
              <p class="text-body-1 text-medium-emphasis max-w-800 mx-auto">
                Gerencie processos complexos com simplicidade e acompanhe tudo em tempo real
              </p>
            </v-col>

            <!-- Cartões de Recursos -->
            <v-col cols="12" md="4" class="d-flex">
              <v-card elevation="4" class="pa-6 flex-grow-1 text-center">
                <v-icon size="48" color="primary" class="mb-4">
                  mdi-chart-timeline-variant
                </v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Dashboards Interativos</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Visualize métricas em tempo real com gráficos dinâmicos e indicadores personalizáveis
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="d-flex">
              <v-card elevation="4" class="pa-6 flex-grow-1 text-center">
                <v-icon size="48" color="primary" class="mb-4">
                  mdi-form-select
                </v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Formulários Dinâmicos</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Crie formulários inteligentes que se adaptam conforme as respostas do usuário
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="d-flex">
              <v-card elevation="4" class="pa-6 flex-grow-1 text-center">
                <v-icon size="48" color="primary" class="mb-4">
                  mdi-playlist-check
                </v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Filas de Trabalho</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Organize tarefas em filas prioritárias com distribuição automática entre equipes
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- Seção de Destaque -->
      <v-col cols="12" class="py-16 bg-grey-lighten-4">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6">
              <h2 class="text-h4 font-weight-bold mb-4">
                Gestão Completa de Processos
              </h2>
              <p class="text-body-1 mb-6 text-medium-emphasis">
                Segmentação inteligente em <strong>tarefas</strong> e <strong>processos</strong> permite
                controle granular sobre cada etapa do fluxo. Defina responsáveis, prazos e dependências
                com apenas alguns cliques.
              </p>
              <v-list class="bg-transparent">
                <v-list-item>
                  <v-list-item-title class="d-flex align-center">
                    <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                    Mapeamento visual de fluxos
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="d-flex align-center">
                    <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                    Automação de aprovações
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="d-flex align-center">
                    <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                    Rastreamento em tempo real
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6" class="text-center">
              <v-responsive class="mx-auto" max-width="500">
                <div class="placeholder-image bg-grey-lighten-2 rounded-xl d-flex align-center justify-center fill-height">
                  <v-icon size="80" color="grey-darken-1">mdi-image-outline</v-icon>
                </div>
              </v-responsive>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Componente simples de página inicial - não requer lógica adicional
</script>

<style scoped>
.max-w-800 {
  max-width: 800px;
}
.placeholder-image {
  height: 300px;
}
</style>