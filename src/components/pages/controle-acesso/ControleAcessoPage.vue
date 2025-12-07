<template>
  <v-card>
    <v-tabs
        v-model="tab"
        align-tabs="center"
        color="deep-purple-accent-4"
        stacked
    >
      <v-tab v-for="item in telas" :key="item.id" :value="item.id">
        <v-icon :icon="item.icon"></v-icon>

        {{ item.title}}
      </v-tab>

    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="administracao" lazy>
        <AdministracaoPage/>
      </v-tabs-window-item>
      <v-tabs-window-item v-for="item in telas" :key="item.id" :value="item.id" lazy>
        <component :is="item.componente"  />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script setup>

import {ref} from "vue";
import { defineAsyncComponent, markRaw } from 'vue'
import AdministracaoPage from "@/components/pages/controle-acesso/sub-pages/AdministracaoPage.vue";

const tab = ref(null)

const telas = markRaw([
  {
    id: 'administracao',
    title: 'ADM',
    title_page: 'Central de Administração e Governança',
    icon: 'mdi-cog-outline',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/AdministracaoPage.vue')),
  },
  {
    id: 'organizacao',
    title: 'Organizações',
    title_page: 'Gestão de Empresas e Organizações',
    icon: 'mdi-cog-outline',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/OrganizacaoPage.vue')),
  },
  {
    id: 'user',
    title: 'Usuários',
    title_page: 'Gestão de Usuários',
    icon: 'mdi-account',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/UserPage.vue'))
  },
  {
    id: 'role',
    title: 'Perfis',
    title_page: 'Gestão de Perfis e Papéis Funcionais',
    icon: 'mdi-account-group',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/RolePage.vue'))
  },
  {
    id: 'permission',
    title: 'Permissões',
    title_page: 'Gestãos de Permissões',
    icon: 'mdi-table-key',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/PermissionPage.vue'))
  },
  {
    id: 'menu',
    title: 'Menu',
    title_page: 'Gestãos de Menus',
    icon: 'mdi-menu-open',
    componente: defineAsyncComponent(() => import('@/components/pages/controle-acesso/sub-pages/MenuPage.vue'))
  },
])


</script>
