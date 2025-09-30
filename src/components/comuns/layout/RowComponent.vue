<template>
  <v-row v-bind="$attrs">
    <slot/>
  </v-row>
</template>

<script>
export default {
  name: "RowComponent"
}
</script>