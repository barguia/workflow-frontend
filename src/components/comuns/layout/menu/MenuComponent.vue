<template>
  <app-bar-component app color="blue-darken-4" dark elevate-on-scroll flat>
    <toolbar-title-component class="nav-links mx-4">
      <RouterLink to="/" class="nav-link font-weight-bold">
        <span v-if="!isMobile"> AuriWeb</span>
        <span v-else> AuriWeb</span>
      </RouterLink>
    </toolbar-title-component>

    <div class="nav-links mx-4" v-if="!isMobile">
      <RouterLink
          :to="item.path"
          v-for="item in menus"
          :key="item.name"
          class="nav-link"
      >
        {{ item.name }}
      </RouterLink >
    </div>

    <!-- Ícone de menu hambúrguer para telas pequenas -->
    <button-component icon v-else @click="drawer = !drawer">
      <icon-component>mdi-menu</icon-component>
    </button-component>
  </app-bar-component>

</template>

<script>
import AppBarComponent from "@/components/comuns/layout/AppBarComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import IconComponent from "@/components/comuns/IconComponent.vue";
import ToolbarTitleComponent from "@/components/comuns/nav-menus/ToolbarTitleComponent.vue";

export default {
  components: {
    ToolbarTitleComponent,
    IconComponent,
    ButtonComponent,
    AppBarComponent
  },
  props: ['menus'],
}
</script>



<style scoped>

</style>