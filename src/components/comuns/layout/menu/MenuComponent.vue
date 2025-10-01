<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Workflow Management System</v-toolbar-title>
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
          <v-list-item title="Perfil"></v-list-item>
          <v-list-item title="Logout"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
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

    <v-main class="main-content main-content-fluid" fluid>
      <container-component fluid class="pa-0">
        <v-row class="justify-center">
          <v-col class="content-box pa-1 pa-sm-0 pa-sm-0" cols="12" md="12" lg="12" xl="12">
            <div class="content-container">
              <RouterView />
            </div>
          </v-col>
        </v-row>
      </container-component>
    </v-main>
  </v-app>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import MenuNodeComponent from "@/components/comuns/layout/menu/componentes/MenuNodeComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";

const router = useRouter()
const drawer = ref(true)
const search = ref('')
const openAtLevel = reactive({})
const opened = ref([])

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

const go = path => () => router.push(path)

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: 'mdi-chart-bar', action: go('/dashboard') },
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
.menu-group .v-list-item__prepend .v-icon,
.submenu-item .v-list-item__prepend .v-icon { font-size: 18px !important; }

.v-list-item:hover {
  background-color: #f0f0f0;   /* cor ao passar o mouse */
  cursor: pointer;
}
</style>