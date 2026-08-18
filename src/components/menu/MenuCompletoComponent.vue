<template>
  <AppBarComponent
    app
    elevation="1"
  >
    <AppBarNavIconComponent
      v-if="authStore.isAuthenticated"
      data-testid="menu-toggle"
      @click="drawer = !drawer"
    />

    <ToolbarTitleComponent>
      <router-link
        to="/"
        class="nav-link brand-title"
      >
        <IconComponent
          color="primary"
          size="22"
          class="mr-1"
        >
          mdi-circle-multiple-outline
        </IconComponent>
        Workflow
      </router-link>
    </ToolbarTitleComponent>

    <SpacerComponent />

    <ThemeSwitcherComponent />

    <DividerComponent
      vertical
      inset
      class="mx-1"
      style="height: 24px; align-self: center;"
    />

    <!-- Menu de Perfil -->
    <MenuComponent
      location="bottom end"
      :close-on-content-click="true"
    >
      <template #activator="{ props }">
        <ButtonComponent
          v-bind="props"
          icon
          variant="text"
          size="small"
        >
          <AvatarComponent
            color="primary"
            size="34"
          >
            <IconComponent size="18">
              mdi-account
            </IconComponent>
          </AvatarComponent>
        </ButtonComponent>
      </template>

      <CardComponent
        min-width="200"
        rounded="lg"
        elevation="4"
      >
        <v-list
          density="compact"
          nav
          class="pa-2"
        >
          <v-list-subheader class="text-caption font-weight-bold text-uppercase px-2 mb-1">
            Conta
          </v-list-subheader>

          <ListItemComponent
            v-if="authStore.isAuthenticated"
            prepend-icon="mdi-account-circle-outline"
            title="Perfil"
            rounded="lg"
          />

          <DividerComponent class="my-1" />

          <ListItemComponent
            v-if="authStore.isAuthenticated"
            prepend-icon="mdi-logout"
            title="Sair"
            rounded="lg"
            base-color="error"
            @click="efetuaLogout"
          />

          <router-link
            v-else
            to="/login"
            class="nav-link brand-title"
          >
            <ListItemComponent
              prepend-icon="mdi-login"
              title="Login"
              rounded="lg"
              base-color="sucess"
            />
          </router-link>
        </v-list>
      </CardComponent>
    </MenuComponent>
  </AppBarComponent>

  <!-- Navigation Drawer -->
  <NavigationDrawerComponent
    v-if="authStore.isAuthenticated"
    v-model="drawer"
    app
    temporary
    width="300"
  >
    <!-- Cabeçalho do drawer -->
    <div class="drawer-header pa-4 d-flex align-center gap-2">
      <IconComponent
        color="primary"
        size="26"
      >
        mdi-circle-multiple-outline
      </IconComponent>
      <span class="text-subtitle-1 font-weight-bold">Workflow</span>
    </div>

    <DividerComponent />

    <ListComponent
      v-model:opened="opened"
      nav
      density="compact"
      class="pa-2"
    >
      <MenuNodeComponent
        v-for="item in menus"
        :key="item.id"
        :node="item"
        :level="0"
        :open-at-level="openAtLevel"
        @toggle="handleToggle"
      />
    </ListComponent>
  </NavigationDrawerComponent>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

import MenuNodeComponent from '@/components/menu/componentes/MenuNodeComponent.vue'
import ThemeSwitcherComponent from '@/components/menu/componentes/ThemeSwitcherComponent.vue'
import AppBarComponent from '@/components/comuns/navigations/AppBarComponent.vue'
import AppBarNavIconComponent from '@/components/comuns/navigations/AppBarNavIconComponent.vue'
import ToolbarTitleComponent from '@/components/comuns/navigations/ToolbarTitleComponent.vue'
import ListComponent from '@/components/comuns/lists/ListComponent.vue'
import ListItemComponent from '@/components/comuns/lists/ListItemComponent.vue'
import NavigationDrawerComponent from '@/components/comuns/navigations/NavigationDrawerComponent.vue'
import MenuComponent from '@/components/comuns/navigations/MenuComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import AvatarComponent from '@/components/comuns/containers/AvatarComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'

const router = useRouter()
const drawer = ref(false)
const openAtLevel = reactive({})
const opened = ref([])
const authStore = useAuthStore()

// Menu hardcoded com os dashboards de mobilidade criados nesta branch,
// já que ainda não existe cadastro de menu para eles no backend.
const menusHardcoded = [
  {
    id: 'dashboards-mobilidade',
    title: 'Dashboards',
    icon: 'mdi-view-dashboard-outline',
    children: [
      { id: 'dash-mobilidade-exemplo', title: 'Mobilidade Exemplo', icon: 'mdi-graph-outline', path: '/mobilidade-exemplo' },
      { id: 'dash-mobilidade-vue-flow', title: 'Mobilidade Vue Flow', icon: 'mdi-graph-outline', path: '/mobilidade-vue-flow' },
      { id: 'dash-mobilidade-vue-flow-tipos-edge', title: 'Mobilidade Vue Flow Tipos de Edge', icon: 'mdi-graph-outline', path: '/mobilidade-vue-flow-tipos-edge' },
      { id: 'dash-mobilidade-vue-flow-layout-dagre', title: 'Mobilidade Vue Flow Layout Dagre', icon: 'mdi-graph-outline', path: '/mobilidade-vue-flow-layout-dagre' },
      { id: 'dash-mobilidade-vue-flow-nesting', title: 'Mobilidade Vue Flow Nesting', icon: 'mdi-graph-outline', path: '/mobilidade-vue-flow-nesting' },
      { id: 'dash-mobilidade-vue-flow-grupos-processo', title: 'Mobilidade Vue Flow Grupos de Processo', icon: 'mdi-graph-outline', path: '/mobilidade-vue-flow-grupos-processo' },
      { id: 'dash-mobilidade-vis-network-simples', title: 'Mobilidade Vis Network Simples', icon: 'mdi-graph-outline', path: '/mobilidade-vis-network-simples' },
      { id: 'dash-mobilidade-vis-network', title: 'Mobilidade Vis Network', icon: 'mdi-graph-outline', path: '/mobilidade-vis-network' },
      { id: 'dash-mobilidade-vis-network-livre', title: 'Mobilidade Vis Network Livre', icon: 'mdi-graph-outline', path: '/mobilidade-vis-network-livre' },
      { id: 'dash-mobilidade-nomeada-vue-flow-simples', title: 'Mobilidade Nomeada Vue Flow Simples', icon: 'mdi-graph-outline', path: '/mobilidade-nomeada-vue-flow-simples' },
      { id: 'dash-mobilidade-nomeada-vue-flow', title: 'Mobilidade Nomeada Vue Flow', icon: 'mdi-graph-outline', path: '/mobilidade-nomeada-vue-flow' },
      { id: 'dash-mobilidade-nomeada-vis-network-simples', title: 'Mobilidade Nomeada Vis Network Simples', icon: 'mdi-graph-outline', path: '/mobilidade-nomeada-vis-network-simples' },
      { id: 'dash-mobilidade-nomeada-vis-network', title: 'Mobilidade Nomeada Vis Network', icon: 'mdi-graph-outline', path: '/mobilidade-nomeada-vis-network' },
    ],
  },
]

const menus = computed(() => [...authStore.getMenus, ...menusHardcoded])

function handleToggle({ level, id }) {
  openAtLevel[level] = id

  Object.keys(openAtLevel)
    .map(n => Number(n))
    .filter(n => n > level)
    .forEach(n => (openAtLevel[n] = null))

  opened.value = Object.entries(openAtLevel)
    .filter(([, val]) => !!val)
    .map(([lvl, val]) => `${lvl}:${val}`)
}

async function efetuaLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.brand-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
  color: rgb(var(--v-theme-textPrimary));
  text-decoration: none;
}

.drawer-header {
  background: rgb(var(--v-theme-surface));
  min-height: 64px;
}

:deep(.v-navigation-drawer__content) {
  background: rgb(var(--v-theme-surface));
}

:deep(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
