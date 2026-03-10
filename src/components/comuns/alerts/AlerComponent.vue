<template>
  <v-alert v-bind="$attrs">
    <slot/>
  </v-alert>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AlertComponent',
  inheritAttrs: false,
});
</script>