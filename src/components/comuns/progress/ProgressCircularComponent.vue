<template>
  <v-progress-circular v-bind="$attrs">
    <slot/>
  </v-progress-circular>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProgressCircularComponent',
  inheritAttrs: false,
});
</script>