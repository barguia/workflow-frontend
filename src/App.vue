<template>
  <app-component>

<!--    <menu-component :menus="getMenus"/>-->
    <menu-component2/>
    <!-- Drawer de navegação para telas menores -->


    <v-main class="main-content main-content-fluid" fluid>
      <container-component fluid class="flex-grow-1 pa-0">
        <v-row class="justify-center">
          <v-col class="content-box pa-1 pa-sm-0 pa-sm-0" cols="12" md="12" lg="12" xl="12">
            <div class="content-container">
              <RouterView />
            </div>
          </v-col>
        </v-row>
      </container-component>

      <footer-component :menus="getMenus"/>
    </v-main>

    <!-- Overlay para o loading css, com z-index elevado -->
    <v-overlay
        :model-value="isLoading()"
        scrim="#000"
        opacity="0.5"
        z-index="9999"
        persistent
        class="d-flex align-center justify-center">
      <v-progress-circular indeterminate size="64" color="primary" />
      <p class="mt-4 text-white">Carregando...</p>
    </v-overlay>
  </app-component>

</template>

<script>
import { useTheme } from 'vuetify';
import router from '@/router';
import FooterComponent from "@/components/comuns/layout/FooterComponent.vue";
import { useLoading } from '@/composables/useLoading';
import AppComponent from "@/components/comuns/layout/AppComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import MenuComponent from "@/components/comuns/layout/menu/MenuComponent.vue";

export default {
  components: {
    MenuComponent2: MenuComponent,
    MenuComponent,
    ContainerComponent,
    FooterComponent,
    AppComponent,
  },
  data() {
    return {
      selectedTheme: localStorage.getItem('theme') || 'light',
      todas_rotas: router.options.routes,
      isMobile: false,
      drawer: false,
    };
  },
  setup() {
    const theme = useTheme();
    const { isLoading } = useLoading();

    return {
      theme,
      isLoading,
    };
  },
  created() {
    this.theme.change(this.selectedTheme)
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    },
  },
  computed: {
    getMenus() {
      return this.todas_rotas.filter(r => {
        if (r.meta?.hidden === true) return false
        const n = typeof r.name === 'string' ? r.name.trim().toLowerCase() : ''
        const isWildcard404 = r.path.includes(':pathMatch')
        return n !== 'not-found' && !isWildcard404 && !!n
      })
    }
  },
};
</script>

<style scoped>

.v-overlay {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fade-in {
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
