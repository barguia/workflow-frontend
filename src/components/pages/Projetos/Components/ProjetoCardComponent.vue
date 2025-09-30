<template>
  <v-col :cols="cols" :sm="sm" :md="md" :lg="lg" :xl="xl">
    <v-card
        class="pa-6 fade-in d-flex flex-column project-card"
        flat
        :height="height"
        :style="{ minHeight: '100%' }"
        @click="toggleProject"
        :to="to"
        tag="router-link"
        hover
    >
      <v-img :src="project.imagem" :alt="project.titulo" height="150" class="mb-4" :lazy-src="lazySrc"></v-img>
      <v-card-title class="justify-center">{{ project.titulo }}</v-card-title>
      <v-card-text class="flex-grow-1">{{ project.resumo }}</v-card-text>
      <v-list dense v-if="isExpanded">
        <v-list-item
            v-for="(detalhe, index) in project.detalhes"
            :key="index"
            class="module-item"
        >
          <v-list-item-title class="font-weight-bold text-wrap">{{ detalhe.titulo }}</v-list-item-title>
          <p class="text-paragraph">{{ detalhe.descricao }}</p>
        </v-list-item>
      </v-list>

    </v-card>
  </v-col>
</template>

<script>


export default {
  name: 'ProjetoCardComponent',
  components: {  },
  props: {
    project: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    expandedIndex: {
      type: Number,
      default: -1,
    },
    to: {
      type: [String, Object],
      default: null,
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
      default: 6, // 2 colunas em md
    },
    lg: {
      type: [String, Number],
      default: 6, // 3 colunas em lg
    },
    xl: {
      type: [String, Number],
      default: 6, // 4 colunas em xl
    },
    height: {
      type: [String, Number],
      default: 'auto', // Pode ser fixo como '300px' para tamanhos iguais
    },
    lazySrc: {
      type: String,
      default: '',
    },
  },
  computed: {
    isExpanded() {
      return this.expandedIndex === this.index;
    },
  },
  methods: {
    toggleProject() {
      this.$emit('toggle', this.index);
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

.project-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.project-card:hover {
  background-color: var(--v-theme-blue-lighten-5, #e0f2fe);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.project-card:hover .v-card-title {
  color: var(--v-theme-blue-lighten-3, #93c5fd);
}

.project-details {
  padding-top: 12px;
}
</style>