<template>
  <!-- Nó com filhos -->
  <v-list-group
      v-if="hasChildren"
      :value="isOpen"
      class="menu-group"
  >
    <template #activator="{ props }">
      <v-list-item
          v-bind="props"
          :prepend-icon="node.icon"
          :title="node.title"
          @click.stop="toggleHere"
      />
    </template>

    <menu-node-component
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :open-at-level="openAtLevel"
        @toggle="emit('toggle', $event)"
    />
  </v-list-group>

  <!-- Folha -->
  <v-list-item
      v-else
      :prepend-icon="node.icon"
      :title="node.title"
      class="submenu-item"
      @click="node.action && node.action()"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, required: true },
  openAtLevel: { type: Object, required: true }, // reactive record: { [level]: id|null }
})
const emit = defineEmits(['toggle'])

const hasChildren = computed(() =>
    Array.isArray(props.node.children) && props.node.children.length > 0
)

const isOpen = computed(() =>
    props.openAtLevel[props.level] === props.node.id
)

function toggleHere () {
  emit('toggle', { level: props.level, id: isOpen.value ? null : props.node.id })
}
</script>

<style scoped>
.menu-group .v-list-item,
.submenu-item {
  min-height: 32px !important;
}
</style>
