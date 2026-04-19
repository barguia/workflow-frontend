<template>
  <v-text-field ref="fieldRef" autocomplete="off" v-bind="attrsWithoutMask" />
</template>

<script setup>
import { ref, computed, useAttrs, onMounted, onBeforeUnmount } from 'vue'
import { MaskInput } from 'maska'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const fieldRef = ref(null)
let maskInstance = null

const attrsWithoutMask = computed(() => {
  const { mask, ...rest } = attrs
  return rest
})

const parseMask = (mask) => {
  if (!mask) return null
  const parts = mask.split(',').map(m => m.trim()).filter(Boolean)
  return parts.length === 1 ? parts[0] : parts
}

onMounted(() => {
  const mask = parseMask(attrs.mask)
  if (!mask) return
  const input = fieldRef.value?.$el?.querySelector('input')
  if (input) maskInstance = new MaskInput(input, { mask })
})

onBeforeUnmount(() => maskInstance?.destroy())
</script>
