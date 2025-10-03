<template>
  <v-navigation-drawer v-bind="$attrs">
    <slot/>
  </v-navigation-drawer>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NavigationDrawerComponent',
  inheritAttrs: false,
});
</script>