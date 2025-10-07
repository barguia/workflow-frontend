<template>
  <v-list-group
    v-if="hasChildren"
    :value="groupKey"
    v-model:opened="opened"
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

  <router-link :to="node.path" class="nav-link hover:text-blue-300 text-wrap" v-else>
    <v-list-item
        :prepend-icon="node.icon"
        v-model:opened="opened"
        class="submenu-item"
        :title="node.title"
    />
  </router-link>


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
const opened = computed(() => props.openAtLevel[props.level] === props.node.id)

function toggleHere () {
  emit('toggle', { level: props.level, id: opened.value ? null : props.node.id })
}
</script>

<style scoped>
.menu-group .v-list-item,
.submenu-item {
  min-height: 32px !important;
  --indent-padding: calc(var(--parent-padding))/2;
}


.v-list-item:hover {
  background-color: #f0f0f0;   /* cor ao passar o mouse */
  cursor: pointer;
}
</style>
