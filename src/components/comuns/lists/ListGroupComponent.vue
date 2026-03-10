<template>
  <v-list-group v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </v-list-group>
</template>

<script>
export default {
  name: "ListGroupComponent"
}
</script>

<style scoped>

</style>