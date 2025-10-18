<template>
  <AppComponent>
    <MenuComponent/>

    <MainComponent class="main-content main-content-fluid" fluid >
      <ContainerComponent fluid class="pa-0">
        <row-component class="justify-center">
          <ColComponent class="content-box pa-1 pa-sm-0 pa-sm-0" cols="12" md="12" lg="12" xl="12">
            <div class="content-container">
              <RouterView />

              <SnackbarComponent
                  v-model="showSnackbar"
                  :color="type"
                  timeout="5000"
                  location="top"
              >
                {{ message }}
                <template #actions>
                  <v-btn color="white" variant="text" @click="clearNotification">Fechar</v-btn>
                </template>
              </SnackbarComponent>
            </div>
          </ColComponent>
        </row-component>
      </ContainerComponent>
    </MainComponent>
    <OverlayComponent
        :model-value="isLoading()"
        scrim="#000"
        opacity="0.5"
        z-index="9999"
        persistent
        class="d-flex align-center justify-center">
      <ProgressCircularComponent indeterminate size="64" color="primary" />
      <p class="mt-4 text-white">Carregando...</p>
    </OverlayComponent>
  </AppComponent>

</template>

<script>
import { useTheme } from 'vuetify';
import router from '@/router';
import { useNotifications } from '@/composables/useNotifications.js';
import { useAuthStore } from '@/stores/authStore';
import { useLoading } from '@/composables/useLoading';

import MenuCompletoComponent from "@/components/menu/MenuCompletoComponent.vue";
import AppComponent from "@/components/comuns/navigations/AppComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import FooterComponent from "@/components/comuns/layout/FooterComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import SnackbarComponent from "@/components/comuns/alerts/SnackbarComponent.vue";
import MainComponent from "@/components/comuns/containers/MainComponent.vue";
import OverlayComponent from "@/components/comuns/containers/OverlayComponent.vue";
import ProgressCircularComponent from "@/components/comuns/progress/ProgressCircularComponent.vue";



export default {
  components: {
    ProgressCircularComponent,
    OverlayComponent,
    MainComponent,
    SnackbarComponent,
    ColComponent,
    RowComponent,
    MenuComponent: MenuCompletoComponent,
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
      autenticado: false,
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
  async mounted() {
    const authStore = useAuthStore();
    await authStore.checkAuth();
    this.autenticado = authStore.isAuthenticated
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
