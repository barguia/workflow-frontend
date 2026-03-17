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
        color="primary"
        variant="tonal"
        :class="['menu-item', 'menu-parent', `level-${level}`]"
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
    color="primary"
    :class="['menu-item', 'menu-leaf', `level-${level}`]"
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

function toggleHere() {
  emit('toggle', { level: props.level, id: opened.value ? null : props.node.id })
}
</script>

<style scoped>
/* Base */
.menu-item {
  margin-bottom: 2px;
}

/* Pai (tem filhos) — tonal já aplicado pelo variant, reforça peso */
.menu-parent {
  font-weight: 600;
}
.menu-parent :deep(.v-list-item__prepend .v-icon) {
  opacity: 0.85;
}

/* Folha (link) — padrão, mais suave */
.menu-leaf {
  font-weight: 400;
}
.menu-leaf :deep(.v-list-item__prepend .v-icon) {
  opacity: 0.65;
}

/* Nível 0 */
.menu-item.level-0 {
  min-height: 38px !important;
  font-size: 0.875rem;
}
.menu-item.level-0 :deep(.v-list-item__prepend .v-icon) {
  font-size: 18px;
}

/* Nível 1 */
.menu-item.level-1 {
  min-height: 32px !important;
  font-size: 0.8125rem;
}
.menu-item.level-1 :deep(.v-list-item__prepend .v-icon) {
  font-size: 15px;
}

/* Nível 2+ */
.menu-item.level-2 {
  min-height: 28px !important;
  font-size: 0.775rem;
}
.menu-item.level-2 :deep(.v-list-item__prepend .v-icon) {
  font-size: 13px;
}

/* Hover — destaca ícone */
.menu-item:hover :deep(.v-list-item__prepend .v-icon) {
  opacity: 1 !important;
}
</style>
