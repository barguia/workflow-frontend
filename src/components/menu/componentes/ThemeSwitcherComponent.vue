<template>
  <v-menu location="bottom end" :close-on-content-click="true">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text" size="small" :title="activeTheme?.label">
        <v-icon size="22">{{ activeTheme?.icon }}</v-icon>
      </v-btn>
    </template>

    <v-card min-width="180" elevation="4" rounded="lg">
      <v-list density="compact" nav class="pa-2">
        <v-list-subheader class="text-caption font-weight-bold text-uppercase px-2 mb-1">
          Aparência
        </v-list-subheader>

        <v-list-item
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
            <v-icon v-if="themeStore.currentTheme === tema.key" size="16" color="primary">
              mdi-check
            </v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/themeStore.js'

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
