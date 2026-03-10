<template>
  <ContainerComponent class="fill-height d-flex align-center justify-center text-center" tag="main">
    <div>
      <IconComponent size="72" aria-hidden="true">mdi-emoticon-confused-outline</IconComponent>
      <CardTitleComponent class="text-h4 mt-4" role="heading" aria-level="1">
        Página não encontrada
      </CardTitleComponent>
      <p class="text-body-1 mt-2">
        A página que você procura não existe ou foi movida.
      </p>

      <div class="mt-6 d-flex gap-2 justify-center">

      </div>
    </div>
  </ContainerComponent>
</template>

<script>
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'

export default {
  name: 'PageNotFoundView',
  components: { ContainerComponent, IconComponent, CardTitleComponent },
}
</script>
