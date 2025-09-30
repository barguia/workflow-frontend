<template>
  <div>
    <section class="py-16 hero-overlay" id="sobre-nos">
      <v-container class="text-center text-white fade-in">
        <h1 class="text-h3 font-weight-bold mb-4">Quem Somos</h1>
        <p class="text-h6 mb-6">Fundada em 2025, a AuriWeb é especialista em desenvolvimento web, automação e IA generativa, entregando soluções customizadas que transformam negócios.</p>
      </v-container>
    </section>

    <section class="py-16" style="background-color: #f5f5f5;">
      <v-container>
        <v-row>
          <v-col cols="12">
            <h2 class="text-h4 font-weight-bold text-center mb-8 fade-in">Nossa Essência</h2>
          </v-col>
          <sobre-nos-card-component
              title="Missão"
              text="Transformar negócios com soluções inovadoras, escaláveis e centradas no cliente."
              icon="mdi-lightbulb"
              icon-color="yellow"
          />

          <sobre-nos-card-component
              title="Visão"
              text="Ser referência em desenvolvimento de software com IA no Brasil até 2030"
              icon="mdi-eye"
          />

          <sobre-nos-card-component
              title="Valores"
              text="Respeito, inovação, parceria, transparência e excelência técnica."
              icon="mdi-heart"
              icon-color="red"
          />

          <sobre-nos-card-component
              title="Compromisso"
              text="Entregar valor excepcional aos nossos clientes, promovendo impacto positivo e sustentável."
              icon="mdi-handshake"
              icon-color="black"
          />

        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script>
import SobreNosCardComponent from "@/components/pages/SobreNos/Componentes/SobreNosCardComponent.vue";

export default {
  name: 'SobreNosPage',
  components: {SobreNosCardComponent},
}
</script>
