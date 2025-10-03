<template>
  <v-overlay v-bind="$attrs">
    <slot/>
  </v-overlay>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OverlayComponent',
  inheritAttrs: false,
});
</script>