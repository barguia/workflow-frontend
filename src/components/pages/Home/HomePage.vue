<template>
  <div>
    <section id="home" class="hero-overlay py-16">
      <v-container class="text-center text-white fade-in p-0" max-width="1440">
        <v-row justify="center" class="m-0 py-md-6 py-lg-4 py-xl-12">
          <v-col cols="12" class="m-0 p-0">
            <h1 class="title mb-4">Desenvolvemos Soluções Web que Transformam Seu Negócio</h1>
            <p class="text-paragraph text-center">Especialistas em plataformas customizadas, automação escalável e integração com IA generativa. De agendamentos otimizados a chatbots no WhatsApp, criamos tecnologia sob medida que impulsiona resultados.</p>
            <v-btn color="blue" dark class="mr-4" rounded="xl" href="/contatos">
              Entre em contato conosco
            </v-btn>
            <v-btn color="transparent" elevated="plain" href="/projetos">Veja Nossos Projetos</v-btn>
          </v-col>
        </v-row>

        <v-row justify="center" class="text-center">
          <v-col cols="12">
            <v-carousel
                show-arrows
                show-arrows-on-hover
                cycle
                interval="3000"
                hide-delimiter-background
                class="my-5"
            >
              <v-carousel-item v-for="(image, i) in images" :key="i">
                <v-img
                    :src="image.src"
                    class="d-flex align-center"
                    height="600"
                    cover
                />
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
      </v-container>
    </section>
    <!-- Seção: Por Que Escolher Nós -->
    <section class="py-16" style="background-color: #f5f5f5;">
      <v-container>
        <h2 class="text-h4 font-weight-bold text-center mb-8 fade-in">Expertise que Faz a Diferença</h2>
        <v-row>
          <home-card-component
            v-for="(expertise, idx) in expertises"
            :key="idx"
            :item="expertise"
          />
        </v-row>
      </v-container>
    </section>

    <sobre-nos-page/>
    <projetos-page/>
    <contato-page/>
  </div>
</template>

<script>



import HomeCardComponent from "@/components/pages/Home/Componentes/HomeCardComponent.vue";
import SobreNosPage from "@/components/pages/SobreNos/SobreNosPage.vue";
import ProjetosPage from "@/components/pages/Projetos/ProjetosPage.vue";
import ContatoPage from "@/components/pages/Contatos/ContatoPage.vue";

export default {
  name: 'HomePage',
  components: {ContatoPage, ProjetosPage, SobreNosPage, HomeCardComponent},
  data() {
    return {
      expertises: [
        {
          titulo: 'Transforme sua visão em realidade',
          texto: 'Dê vida às suas ideias com soluções personalizadas. Desenvolvemos projetos web e automatizações que tornam sua visão realidade, com agilidade e inovação.',
          alt: "Tire sua ideia do papel",
          src: "imgs/user-admin.webp",
        },
        {
          titulo: 'Gestão simplificada com tecnologia',
          texto: 'Substitua e-mails e planilhas por um sistema integrado. Centralize processos, automatize tarefas e gerencie seu negócio com eficiência e controle total.',
          alt: "Gestão Simplificada",
          src: "imgs/solid.webp",
        },
        {
          titulo: "Inovação sem limites",
          texto: "Configuramos fluxos sem código e integramos com sistemas legados, permitindo que sua equipe foque no crescimento.",
          alt: "inovação",
          src: "imgs/tecnologias/etl2.png",
        },
        {
          titulo: "Resultados mensuráveis",
          texto: "Dashboards interativos e relatórios automatizados para decisões rápidas e precisas.",
          alt: "dashboards",
          src: "imgs/databoards.webp",
        },
        {
          titulo: "Tecnologia de ponta",
          texto: "Soluções modernas e inovadoras que acompanham as tendências do mercado e impulsionam o crescimento da sua empresa.",
          alt: "inovação",
          src: "imgs/workflow.webp",
        },
      ],
      images: [
        { src: 'imgs/tecnologias/kafka.webp', title: 'Apache Kafka', alt: 'Apache Kafka' },
        { src: 'imgs/tecnologias/php.webp', title: 'PHP', alt: 'PHP Illustration' },
        { src: 'imgs/tecnologias/phpstorm.webp', title: 'PHPStorm', alt: 'PHPStorm Illustration' },
        { src: 'imgs/tecnologias/vue.webp', title: 'Vue 3', alt: 'Vue 3 Illustration' },
        { src: 'imgs/tecnologias/html.webp', title: 'HTML', alt: 'HTML Illustration' },
        { src: 'imgs/tecnologias/apache-airflow.webp', title: 'Apache Airflow', alt: 'Apache Airflow Illustration' },
        { src: 'imgs/tecnologias/docker.webp', title: 'Docker', alt: 'Docker Illustration' },
      ]
    }
  },
  methods: {
    getExperiencia() {
      return (new Date().getFullYear()) - 2016;
    }
  }
}
</script>

<style scoped>

</style>
