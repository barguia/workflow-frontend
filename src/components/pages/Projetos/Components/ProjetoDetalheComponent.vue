<template>
  <v-card flat class="pa-3">
    <v-card-text>
      <v-row>
        <v-col :cols="12" :md="7" :lg="7">
          <div class="content">
            <h2>{{ project.titulo }}</h2>
            <p class="text-paragraph">{{ project.resumo }}</p>
            <h3>Principais funcionalidades:</h3>
            <v-list dense>
              <v-list-item
                  v-for="(detalhe, index) in project.detalhes"
                  :key="index"
                  class="module-item"
              >
                <v-list-item-title class="font-weight-bold text-wrap">{{ detalhe.titulo }}</v-list-item-title>
                <p class="text-paragraph">{{ detalhe.descricao }}</p>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
        <v-col :cols="12" :md="5" :lg="5">
          <div class="content">
            <v-img
                :src="project.imagem"
                class="d-flex align-center"
                cover
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'ProjetoDetalheComponent',
  props: {
    project: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.module-item {
  margin-bottom: 8px;
  white-space: normal;
}

</style>
