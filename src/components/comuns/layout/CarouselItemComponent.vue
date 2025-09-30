<template>
  <v-carousel-item v-bind="$attrs">
    <slot/>
  </v-carousel-item>
</template>

<script>
export default {
  name: "CarouselItemComponent"
}
</script>