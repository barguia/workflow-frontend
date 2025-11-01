<template>
  <v-textarea  v-bind="$attrs"/>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TextAreaComponent',
  inheritAttrs: false,
});
</script>