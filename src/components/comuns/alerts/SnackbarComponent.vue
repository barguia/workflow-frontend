<template>
  <v-snackbar v-bind="$attrs">
    <slot/>
  </v-snackbar>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SnackbarComponent',
  inheritAttrs: false,
});
</script>