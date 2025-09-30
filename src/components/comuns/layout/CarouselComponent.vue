<template>
  <v-carousel v-bind="$attrs">
    <slot/>
  </v-carousel>
</template>

<script>
export default {
  name: "CarouselComponent"
}
</script>