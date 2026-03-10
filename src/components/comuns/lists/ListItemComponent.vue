<template>
  <v-list-item v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </v-list-item>
</template>

<script>
export default {
  name: "ListItemComponent"
}
</script>

<style scoped>

</style>