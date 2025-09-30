<!-- src/components/FeatureCard.vue -->
<template>
  <v-col :cols="cols" :sm="sm" :md="md" :lg="lg" :xl="xl">
    <v-card class="pa-6 fade-in d-flex flex-column" flat :height="height" :style="{ minHeight: '100%' }">
      <v-img :src="item.src" :alt="item.alt" height="150" class="mb-4" :lazy-src="lazySrc"/>
      <v-card-title class="justify-center">{{ item.titulo }}</v-card-title>
      <v-card-text class="flex-grow-1">{{ item.texto }}</v-card-text>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: 'HomeCardComponent',
  props: {
    item: {
      type: Object,
      required: true,
    },
    lazySrc: {
      type: String,
      default: '',
    },
    cols: {
      type: [String, Number],
      default: 12, // Responsivo: full width em xs
    },
    sm: {
      type: [String, Number],
      default: 6, // 2 colunas em sm
    },
    md: {
      type: [String, Number],
      default: 4, // 3 colunas em md
    },
    lg: {
      type: [String, Number],
      default: 4, // 3 colunas em lg
    },
    xl: {
      type: [String, Number],
      default: 3, // 4 colunas em xl
    },
    height: {
      type: [String, Number],
      default: 'auto', // Pode ser fixo como '300px' para igualar tamanhos
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
</style>