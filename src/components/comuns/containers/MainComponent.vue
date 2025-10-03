<template>
  <v-main v-bind="$attrs">
    <slot/>
  </v-main>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainComponent',
  inheritAttrs: false,
});
</script>