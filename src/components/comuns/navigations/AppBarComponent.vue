<template>
  <v-app-bar v-bind="$attrs">
    <slot/>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppBarComponent"
}
</script>