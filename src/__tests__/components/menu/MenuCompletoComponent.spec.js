import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { shallowMount, config } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import MenuCompletoComponent from '@/components/menu/MenuCompletoComponent.vue'
import AppBarNavIconComponent from '@/components/comuns/navigations/AppBarNavIconComponent.vue'
import NavigationDrawerComponent from '@/components/comuns/navigations/NavigationDrawerComponent.vue'
import MenuNodeComponent from '@/components/menu/componentes/MenuNodeComponent.vue'
import { useAuthStore } from '@/stores/authStore.js'

// Este teste garante que o menu (sidebar) e o ícone de navegação lêem o
// estado de autenticação/menus diretamente e reativamente do authStore
// (sem cópias locais desatualizadas), de modo que, assim que a sessão é
// limpa (ex: por um 401), a UI deixa de exibir dados de um usuário logado.

function criarRouterDeTeste() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div/>' } },
      { path: '/login', name: 'login', component: { template: '<div/>' } },
    ],
  })
}

describe('MenuCompletoComponent — reatividade ao authStore', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = criarRouterDeTeste()
    router.push('/')
    await router.isReady()

    // AppBarNavIconComponent/MenuNodeComponent ficam dentro do slot padrão de
    // componentes stubados (AppBarComponent, ListComponent); é preciso
    // renderizar o conteúdo do slot para poder inspecioná-los no shallowMount.
    config.renderStubDefaultSlot = true
  })

  afterEach(() => {
    config.renderStubDefaultSlot = false
  })

  function montar() {
    return shallowMount(MenuCompletoComponent, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('exibe o toggle do menu, o drawer e os itens de menu quando autenticado', async () => {
    const authStore = useAuthStore()
    authStore.setSessao('token-valido', [
      { id: 1, label: 'Dashboard' },
      { id: 2, label: 'Configurações' },
    ])

    const wrapper = montar()
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(AppBarNavIconComponent).exists()).toBe(true)
    expect(wrapper.findComponent(NavigationDrawerComponent).exists()).toBe(true)
    expect(wrapper.findAllComponents(MenuNodeComponent)).toHaveLength(2)
  })

  it('remove o toggle do menu, o drawer e os itens de menu assim que a sessão é limpa (ex: 401)', async () => {
    const authStore = useAuthStore()
    authStore.setSessao('token-valido', [{ id: 1, label: 'Dashboard' }])

    const wrapper = montar()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAllComponents(MenuNodeComponent)).toHaveLength(1)

    // Simula exatamente o que o interceptor de 401 do axios faz.
    authStore.limpaSessao()
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(AppBarNavIconComponent).exists()).toBe(false)
    expect(wrapper.findComponent(NavigationDrawerComponent).exists()).toBe(false)
    expect(wrapper.findAllComponents(MenuNodeComponent)).toHaveLength(0)
  })

  it('não exibe toggle, drawer nem itens de menu quando não autenticado desde o início', () => {
    const wrapper = montar()

    expect(wrapper.findComponent(AppBarNavIconComponent).exists()).toBe(false)
    expect(wrapper.findComponent(NavigationDrawerComponent).exists()).toBe(false)
    expect(wrapper.findAllComponents(MenuNodeComponent)).toHaveLength(0)
  })
})
