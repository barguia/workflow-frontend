<template>
  <v-text-field v-bind="$attrs"/>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TextFieldComponent',
  inheritAttrs: false,
});
</script>