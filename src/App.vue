<template>
  <app-component>

    <menu-component/>
    <v-main class="main-content main-content-fluid" fluid>
      <container-component fluid class="pa-0">
        <v-row class="justify-center">
          <v-col class="content-box pa-1 pa-sm-0 pa-sm-0" cols="12" md="12" lg="12" xl="12">
            <div class="content-container">
              <RouterView />

              <v-snackbar
                  v-model="showSnackbar"
                  :color="type"
                  timeout="5000"
                  location="top"
              >
                {{ message }}
                <template #actions>
                  <v-btn color="white" variant="text" @click="clearNotification">Fechar</v-btn>
                </template>
              </v-snackbar>
            </div>
          </v-col>
        </v-row>
      </container-component>
    </v-main>
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
import { useNotifications } from '@/composables/useNotifications.js';
import { useAuthStore } from '@/stores/authStore';
import { useLoading } from '@/composables/useLoading';

import MenuComponent from "@/components/menu/MenuComponent.vue";
import AppComponent from "@/components/comuns/navigations/AppComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import FooterComponent from "@/components/comuns/layout/FooterComponent.vue";



export default {
  components: {
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
    const { message, type, showSnackbar, clearNotification } = useNotifications();
    return {
      theme,
      isLoading,
      message,
      type,
      showSnackbar,
      clearNotification,
    };
  },
  mounted() {
    const authStore = useAuthStore();
    authStore.loadToken(); // Restaura do LocalStorage se existir
    if (!authStore.token) {
      router.push('/login'); // Redireciona se não autenticado
    }
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
