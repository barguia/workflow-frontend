<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Workflow Management System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
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
          <v-list-item title="Profile"></v-list-item>
          <v-list-item title="Logout"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item title="Menu" prepend-icon="mdi-menu" class="text-caption" />
        <v-divider />

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

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>


<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import MenuNodeComponent from "@/components/comuns/layout/menu/componentes/MenuNodeComponent.vue";

const router = useRouter()
const drawer = ref(true)

// mapa: nível -> id aberto (ou null)
const openAtLevel = reactive({}) // ex: { 0: 'aplicacao', 1: 'usuarios' }
const opened = ref([])

function handleToggle({ level, id }) {
  // abre/fecha o nível atual
  openAtLevel[level] = id
  console.log('handleToggle -> level:', level, 'id:', id)
  // fecha níveis mais profundos ao trocar um pai
  Object.keys(openAtLevel)
      .map(n => Number(n))
      .filter(n => n > level)
      .forEach(n => (openAtLevel[n] = null))

  // SINCRONIZA o array 'opened' do Vuetify:
  opened.value = Object.entries(openAtLevel)
      .filter(([, val]) => !!val)
      .map(([lvl, val]) => `${lvl}:${val}`) // precisa casar com o 'value' de cada grupo
  console.log(opened.value)
}



// helpers de navegação
const go = path => () => router.push(path)

// sua árvore de menus (pode vir de API)
const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: 'mdi-chart-bar', action: go('/dashboard') },
  {
    id: 'aplicacao',
    title: 'Aplicação',
    icon: 'mdi-file-document',
    children: [
      { id: 'orgs',     title: 'Organizações (empresas)', icon: 'mdi-domain',  action: go('/organizations') },
      { id: 'usuarios', title: 'Usuários',                 icon: 'mdi-account', action: go('/users') },
      { id: 'perfis',   title: 'Perfis',                   icon: 'mdi-shield',  action: go('/profiles') },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow',
    icon: 'mdi-flowchart',
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
</style>