<template v-bind="$attrs">
  <v-toolbar-title>
    <slot/>
  </v-toolbar-title>
</template>

<script>
export default {
  name: "ToolbarTitleComponent",
}
</script>

<style scoped>

</style>