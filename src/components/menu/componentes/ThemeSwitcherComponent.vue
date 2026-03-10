<template>
  <MenuComponent location="bottom end" :close-on-content-click="true">
    <template #activator="{ props }">
      <ButtonComponent v-bind="props" icon variant="text" size="small" :title="activeTheme?.label">
        <IconComponent size="22">{{ activeTheme?.icon }}</IconComponent>
      </ButtonComponent>
    </template>

    <CardComponent min-width="180" elevation="4" rounded="lg">
      <v-list density="compact" nav class="pa-2">
        <v-list-subheader class="text-caption font-weight-bold text-uppercase px-2 mb-1">
          Aparência
        </v-list-subheader>

        <ListItemComponent
          v-for="tema in themeStore.themes"
          :key="tema.key"
          :active="themeStore.currentTheme === tema.key"
          active-color="primary"
          rounded="lg"
          class="mb-1"
          @click="selectTheme(tema.key)"
        >
          <template #prepend>
            <span
              class="theme-dot mr-3"
              :style="{ background: tema.preview }"
            />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ tema.label }}
          </v-list-item-title>
          <template #append>
            <IconComponent v-if="themeStore.currentTheme === tema.key" size="16" color="primary">
              mdi-check
            </IconComponent>
          </template>
        </ListItemComponent>
      </v-list>
    </CardComponent>
  </MenuComponent>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/themeStore.js'
import MenuComponent from '@/components/comuns/navigations/MenuComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import ListItemComponent from '@/components/comuns/lists/ListItemComponent.vue'

const vuetifyTheme = useTheme()
const themeStore = useThemeStore()

const activeTheme = computed(() =>
  themeStore.themes.find(t => t.key === themeStore.currentTheme)
)

function selectTheme(key) {
  themeStore.applyTheme(key, vuetifyTheme)
}
</script>

<style scoped>
.theme-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(var(--v-theme-on-surface), 0.2);
}
</style>
