<template>
  <v-btn :v-bind="$attrs">
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'ButtonComponent',
  props: {
    color: {
      type: String,
      default: 'primary',
    },
    variant: {
      type: String,
      default: 'contained',
    },
  },
  methods: {
    onClick() {
      this.$emit('click');
    },
  },
};
</script>
