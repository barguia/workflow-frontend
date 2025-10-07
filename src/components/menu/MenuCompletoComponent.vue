<template>
  <AppBarComponent app>
    <AppBarNavIconComponent @click="drawer = !drawer"/>
    <ToolbarTitleComponent>Workflow Management System</ToolbarTitleComponent>
    <v-spacer></v-spacer>
    <template v-if="authStore.isAuthenticated">
      <TextFieldComponent
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          variant="underlined"
          placeholder="Search"
          single-line
          hide-details
      />
      <v-menu>
        <template v-slot:activator="{ props }">
          <ButtonComponent v-bind="props" icon>
            <AvatarComponent>
              <IconComponent>mdi-account</IconComponent>
            </AvatarComponent>
          </ButtonComponent>
        </template>
        <ListComponent>
          <ListItemComponent title="Perfil"></ListItemComponent>
          <ListItemComponent title="Logout" @click="efetuaLogout()"></ListItemComponent>
        </ListComponent>
      </v-menu>
    </template>

  </AppBarComponent>

  <NavigationDrawerComponent v-model="drawer" app temporary width=340>
    <ListComponent v-model:opened="opened">
      <MenuNodeComponent
        v-for="item in authStore.getMenus"
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/authStore.js";

import MenuNodeComponent from "@/components/menu/componentes/MenuNodeComponent.vue";
import AppBarComponent from "@/components/comuns/navigations/AppBarComponent.vue";
import AppBarNavIconComponent from "@/components/comuns/navigations/AppBarNavIconComponent.vue";
import ToolbarTitleComponent from "@/components/comuns/navigations/ToolbarTitleComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ListComponent from "@/components/comuns/lists/ListComponent.vue";
import ListItemComponent from "@/components/comuns/lists/ListItemComponent.vue";
import NavigationDrawerComponent from "@/components/comuns/navigations/NavigationDrawerComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import IconComponent from "@/components/comuns/icons/IconComponent.vue";
import AvatarComponent from "@/components/comuns/containers/AvatarComponent.vue";


const router = useRouter()
const drawer = ref(true)
const search = ref('')
const openAtLevel = reactive({})
const opened = ref([])
const authStore = useAuthStore()
console.log(authStore.getMenus)
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

async function  efetuaLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.v-navigation-drawer { background-color: #fff; }

.v-list-item--active { background-color: #212121; color: #fff !important; }

.v-list-item:hover {
  background-color: #f0f0f0;   /* cor ao passar o mouse */
  cursor: pointer;
}
</style>