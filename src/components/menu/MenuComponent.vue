<template>
  <app-bar-component app>
    <app-bar-nav-icon-component @click="drawer = !drawer"></app-bar-nav-icon-component>
    <toolbar-title-component>Workflow Management System</toolbar-title-component>
    <v-spacer></v-spacer>
    <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        variant="underlined"
        placeholder="Search"
        single-line
        hide-details
    ></v-text-field>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-avatar>
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <template v-if="authStore.isAuthenticated">
          <v-list-item title="Perfil"></v-list-item>
          <v-list-item title="Logout" @click="efetuaLogout()"></v-list-item>
        </template>

        <router-link v-else to="/login">
          <v-list-item title="Login"></v-list-item>
        </router-link>

      </v-list>
    </v-menu>
  </app-bar-component>

  <v-navigation-drawer v-model="drawer" app temporary width=340>
    <v-list v-model:opened="opened">

      <menu-node-component
          v-for="item in menuItems"
          :key="item.id"
          :node="item"
          :level="0"
          :open-at-level="openAtLevel"
          @toggle="handleToggle"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MenuNodeComponent from "@/components/menu/componentes/MenuNodeComponent.vue";
import AppBarComponent from "@/components/comuns/navigations/AppBarComponent.vue";
import AppBarNavIconComponent from "@/components/comuns/navigations/AppBarNavIconComponent.vue";
import ToolbarTitleComponent from "@/components/comuns/navigations/ToolbarTitleComponent.vue";
import {useAuthStore} from "@/stores/authStore.js";

const router = useRouter()
const drawer = ref(true)
const search = ref('')
const openAtLevel = reactive({})
const opened = ref([])
const authStore = useAuthStore()

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

function efetuaLogout() {
  authStore.logout()
  router.push('/login')
}
const go = path => () => router.push(path)

const menuItems = [
  { id: 'login', title: 'Login', icon: 'mdi-chart-bar', action: go('/login') },
  {
    id: 'aplicacao',
    title: 'Aplicação',
    icon: 'mdi-file-document',
    children: [
      {
        id: 'orgs',
        title: '',
        icon: 'mdi-file-document',
        children: [
          { id: 'usuarios2', title: 'Usuários',                  action: go('/users') },
          { id: 'perfis2',   title: 'Perfis',                     action: go('/profiles') },
        ],
      },
      { id: 'usuarios', title: 'Usuários',                  action: go('/users') },
      { id: 'perfis',   title: 'Perfis',                     action: go('/profiles') },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow',
    icon: 'mdi-file-document',
    children: [
      { id: 'wfs',   title: 'Workflows',               icon: 'mdi-sitemap',   action: go('/workflows') },
      { id: 'procs', title: 'Processos',               icon: 'mdi-cog',       action: go('/processes') },
      { id: 'tasks', title: 'Tarefas',                 icon: 'mdi-check',     action: go('/tasks') },
      { id: 'hier',  title: 'Hierarquia de Processos', icon: 'mdi-hierarchy', action: go('/hierarchy') },
    ],
  },
]
</script>

<style scoped>
.v-navigation-drawer { background-color: #fff; }

.v-list-item--active { background-color: #212121; color: #fff !important; }

.v-list-item:hover {
  background-color: #f0f0f0;   /* cor ao passar o mouse */
  cursor: pointer;
}
</style>