<template>
  <CardComponent>
    <v-tabs v-model="tab" align-tabs="center" color="primary" stacked>
      <v-tab v-for="item in telas" :key="item.id" :value="item.id">
        <IconComponent :icon="item.icon" />
        {{ item.title }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="item in telas" :key="item.id" :value="item.id">
        <component :is="item.componente" v-if="tab === item.id" />
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

const HASH_PARA_ABA = {
  '#visao-geral':    'visao-geral',
  '#formularios':    'formularios',
  '#campos':         'campos',
  '#regras-campos':  'regras-campos',
}

const ABA_PARA_HASH = Object.fromEntries(
  Object.entries(HASH_PARA_ABA).map(([h, a]) => [a, h])
)

const ABA_PADRAO = 'visao-geral'

function resolverAba(hash)  { return HASH_PARA_ABA[hash] ?? ABA_PADRAO }
function resolverHash(aba)  { return ABA_PARA_HASH[aba]  ?? '#visao-geral' }

const telas = markRaw([
  {
    id: 'visao-geral',
    title: 'Visão Geral',
    icon: 'mdi-view-dashboard-outline',
    componente: defineAsyncComponent(() => import('./sub-pages/VisaoGeralPage.vue')),
  },
  {
    id: 'formularios',
    title: 'Formulários',
    icon: 'mdi-text-box-multiple-outline',
    componente: defineAsyncComponent(() => import('./sub-pages/FormularioPage.vue')),
  },
  {
    id: 'campos',
    title: 'Campos',
    icon: 'mdi-form-textbox',
    componente: defineAsyncComponent(() => import('./sub-pages/CampoPage.vue')),
  },
  {
    id: 'regras-campos',
    title: 'Regras de Campos',
    icon: 'mdi-code-braces',
    componente: defineAsyncComponent(() => import('./sub-pages/RegrasCampoPage.vue')),
  },
])

const tab = ref(resolverAba(route.hash))

watch(tab, (novaAba) => {
  const novoHash = resolverHash(novaAba)
  if (route.hash !== novoHash) {
    router.replace({ hash: novoHash })
  }
})

watch(() => route.hash, (novoHash) => {
  const novaAba = resolverAba(novoHash)
  if (tab.value !== novaAba) {
    tab.value = novaAba
  }
})

onMounted(() => {
  if (!route.hash) {
    router.replace({ hash: resolverHash(ABA_PADRAO) })
  }
})
</script>
