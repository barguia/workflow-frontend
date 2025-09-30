<template>
  <v-col :cols="cols" :sm="sm" :md="md" :lg="lg" :xl="xl">
    <v-card
        class="pa-6 fade-in d-flex flex-column technology-card"
        flat
        :height="height"
        :style="{ minHeight: '100%' }"
        :to="to"
        tag="router-link"
        hover
    >
      <v-card-title class="justify-center">{{ title }}</v-card-title>
      <v-card-text class="flex-grow-1">{{ text }}</v-card-text>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: 'TecnologiaComponent',
  props: {
    lazySrc: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    to: {
      type: [String, Object],
      default: null, // Para navegação com vue-router, se necessário
    },
    cols: {
      type: [String, Number],
      default: 12, // Full width em xs
    },
    sm: {
      type: [String, Number],
      default: 6, // 2 colunas em sm
    },
    md: {
      type: [String, Number],
      default: 3, // 4 colunas em md (baseado no trecho original)
    },
    lg: {
      type: [String, Number],
      default: 3, // 4 colunas em lg
    },
    xl: {
      type: [String, Number],
      default: 2, // 6 colunas em xl (opcional para alta densidade)
    },
    height: {
      type: [String, Number],
      default: 'auto', // Pode ser fixo como '300px' para tamanhos iguais
    },
  },
};
</script>

<style scoped>
.fade-in {
  animation: fadeIn 1s ease-in-out;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Estilo de hover inspirado em links */
.technology-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.technology-card:hover {
  background-color: var(--v-theme-blue-lighten-5, #e0f2fe); /* Fundo claro */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Sombra suave */
  transform: scale(1.05); /* Leve aumento */
}

.technology-card:hover .v-card-title {
  color: var(--v-theme-blue-lighten-3, #93c5fd); /* Título azul claro */
}
</style>
