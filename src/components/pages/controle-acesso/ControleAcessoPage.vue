<template>
  <CardComponent>
    <v-tabs v-model="tab" align-tabs="center" color="primary" stacked>
      <v-tab v-for="item in telas" :key="item.id" :value="item.id">
        <IconComponent :icon="item.icon" />
        {{ item.title }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="item in telas" :key="item.id" :value="item.id" lazy>
        <component :is="item.componente" />
      </v-tabs-window-item>
    </v-tabs-window>
  </CardComponent>
</template>

<script setup>
import { ref, watch, onMounted, defineAsyncComponent, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'

const route  = useRoute()
const router = useRouter()

// ── Mapeamento bidirecional hash ↔ id da aba ──────────────────────────────
const HASH_PARA_ABA = {
  '#adm':          'administracao',
  '#organizacoes': 'organizacao',
  '#usuarios':     'user',
  '#perfis':       'role',
  '#permissoes':   'permission',
  '#menus':        'menu',
}

const ABA_PARA_HASH = Object.fromEntries(
  Object.entries(HASH_PARA_ABA).map(([h, a]) => [a, h])
)

const ABA_PADRAO = 'administracao'

function resolverAba(hash)  { return HASH_PARA_ABA[hash]  ?? ABA_PADRAO }
function resolverHash(aba)  { return ABA_PARA_HASH[aba]   ?? '#adm'     }

// ── Definição das telas ───────────────────────────────────────────────────
const telas = markRaw([
  {
    id: 'administracao',
    title: 'ADM',
    icon: 'mdi-cog-outline',
    componente: defineAsyncComponent(() => import('./sub-pages/AdministracaoPage.vue')),
  },
  {
    id: 'organizacao',
    title: 'Organizações',
    icon: 'mdi-domain',
    componente: defineAsyncComponent(() => import('./sub-pages/OrganizacaoPage.vue')),
  },
  {
    id: 'user',
    title: 'Usuários',
    icon: 'mdi-account',
    componente: defineAsyncComponent(() => import('./sub-pages/UserPage.vue')),
  },
  {
    id: 'role',
    title: 'Perfis',
    icon: 'mdi-account-group',
    componente: defineAsyncComponent(() => import('./sub-pages/RolePage.vue')),
  },
  {
    id: 'permission',
    title: 'Permissões',
    icon: 'mdi-table-key',
    componente: defineAsyncComponent(() => import('./sub-pages/PermissionPage.vue')),
  },
  {
    id: 'menu',
    title: 'Menu',
    icon: 'mdi-menu-open',
    componente: defineAsyncComponent(() => import('./sub-pages/MenuPage.vue')),
  },
])

// ── Estado reativo da aba ──────────────────────────────────────────────────
const tab = ref(resolverAba(route.hash))

// Ao trocar de aba → atualiza hash na URL
watch(tab, (novaAba) => {
  const novoHash = resolverHash(novaAba)
  if (route.hash !== novoHash) {
    router.replace({ hash: novoHash })
  }
})

// Ao navegar com back/forward do browser → sincroniza aba
watch(() => route.hash, (novoHash) => {
  const novaAba = resolverAba(novoHash)
  if (tab.value !== novaAba) {
    tab.value = novaAba
  }
})

// Hash ausente na entrada → redireciona para o padrão
onMounted(() => {
  if (!route.hash) {
    router.replace({ hash: resolverHash(ABA_PADRAO) })
  }
})
</script>
