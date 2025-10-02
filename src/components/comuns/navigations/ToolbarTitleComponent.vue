<template>
  <v-toolbar-title v-bind="$attrs">
    <slot/>
  </v-toolbar-title>
</template>

<script>
export default {
  name: "ToolbarTitleComponent"
}
</script>