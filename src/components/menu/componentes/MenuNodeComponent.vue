<template>
  <!-- Grupo: tem filhos -->
  <ListGroupComponent
    v-if="hasChildren"
    :value="groupKey"
    v-model:opened="opened"
  >
    <template #activator="{ props: activatorProps }">
      <ListItemComponent
        v-bind="activatorProps"
        :prepend-icon="node.icon"
        :title="node.title"
        rounded="lg"
        density="compact"
        active-color="primary"
        class="menu-item"
        :style="indentStyle"
        @click.stop="toggleHere"
      />
    </template>

    <MenuNodeComponent
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :level="level + 1"
      :open-at-level="openAtLevel"
      @toggle="$emit('toggle', $event)"
    />
  </ListGroupComponent>

  <!-- Folha: navega para rota -->
  <ListItemComponent
    v-else
    :prepend-icon="node.icon"
    :title="node.title"
    :to="node.path || undefined"
    rounded="lg"
    density="compact"
    active-color="primary"
    class="menu-item"
    :style="indentStyle"
  />
</template>

<script setup>
import { computed } from 'vue'
import ListGroupComponent from '@/components/comuns/lists/ListGroupComponent.vue'
import ListItemComponent from '@/components/comuns/lists/ListItemComponent.vue'

defineOptions({ name: 'MenuNodeComponent' })

const props = defineProps({
  node:        { type: Object,  required: true },
  level:       { type: Number,  required: true },
  openAtLevel: { type: Object,  required: true },
})

const emit = defineEmits(['toggle'])

const hasChildren = computed(() =>
  Array.isArray(props.node.children) && props.node.children.length > 0
)

const groupKey = computed(() => `${props.level}:${props.node.id}`)
const opened   = computed(() => props.openAtLevel[props.level] === props.node.id)

const indentStyle = computed(() => ({
  paddingLeft: `${props.level * 10}px`,
}))

function toggleHere() {
  emit('toggle', { level: props.level, id: opened.value ? null : props.node.id })
}
</script>

<style scoped>
.menu-item {
  min-height: 36px !important;
  margin-bottom: 2px;
  font-size: 0.875rem;
}

.menu-item :deep(.v-list-item__prepend .v-icon) {
  opacity: 0.75;
  font-size: 18px;
}

.menu-item:hover :deep(.v-list-item__prepend .v-icon) {
  opacity: 1;
}
</style>
