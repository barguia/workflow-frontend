<template>
  <v-progress-linear v-bind="$attrs">
    <slot/>
  </v-progress-linear>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProgressLinearComponent',
  inheritAttrs: false,
});
</script>