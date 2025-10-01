<template>
  {{hasChildren}}
  <v-list-group
    v-if="hasChildren"
    :value="groupKey"
    class="menu-group"
  >
    <template #activator>
      <v-list-item
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
        @toggle="$emit('toggle', $event)"
    />
  </v-list-group>

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
defineOptions({ name: 'MenuNodeComponent' })

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, required: true },
  openAtLevel: { type: Object, required: true },
})
const emit = defineEmits(['toggle'])

const hasChildren = computed(() =>
    Array.isArray(props.node.children) && props.node.children.length > 0
)
/** chave única por nível+id, ex.: "0:aplicacao" */
const groupKey = computed(() => `${props.level}:${props.node.id}`)

/** controla só a sua lógica; quem abre visualmente é o v-list via 'opened' */
const isOpen = computed(() => props.openAtLevel[props.level] === props.node.id)

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
