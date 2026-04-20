<template>
  <div class="formulario-overview">
    <ContainerComponent fluid class="py-8 py-md-12">
      <div class="max-width-container">

        <div class="mb-10">
          <h1 class="text-h4 font-weight-medium text-center">
            Central de Formulários Dinâmicos
          </h1>
          <p class="text-body-1 mt-4 text-center text-medium-emphasis" style="max-width: 840px; margin: 0 auto;">
            Área centralizada para criação e configuração de formulários dinâmicos.
            Gerencie formulários, campos reutilizáveis e regras de comportamento entre campos.
          </p>
        </div>

        <RowComponent class="mt-8">
          <ColComponent
            v-for="modulo in modulos"
            :key="modulo.titulo"
            cols="12" md="6" lg="4"
          >
            <div
              class="modulo-card pa-6"
              :class="{ 'modulo-card--clicavel': !!modulo.hash }"
              @click="modulo.hash ? navegar(modulo.hash) : undefined"
            >
              <div class="d-flex align-start ga-4">
                <IconComponent :color="modulo.cor" size="36" class="mt-1">{{ modulo.icone }}</IconComponent>

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <h3 class="text-h6 font-weight-medium">{{ modulo.titulo }}</h3>
                    <IconComponent
                      v-if="modulo.hash"
                      size="18"
                      class="seta-acesso"
                      color="primary"
                    >
                      mdi-arrow-right
                    </IconComponent>
                  </div>
                  <p class="text-body-2 mb-0" style="line-height: 1.6;">{{ modulo.descricao }}</p>
                </div>
              </div>
            </div>
          </ColComponent>
        </RowComponent>

        <DividerComponent class="my-10" />

        <AlertComponent
          border="start"
          border-color="primary"
          variant="tonal"
          class="max-width-container"
          prominent
          icon="mdi-information-outline"
        >
          <strong>Dica:</strong> Crie primeiro os <strong>Campos</strong> reutilizáveis, depois monte os
          <strong>Formulários</strong> e por fim defina as <strong>Regras</strong> para controlar o comportamento
          dinâmico entre campos.
        </AlertComponent>

      </div>
    </ContainerComponent>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import AlertComponent from '@/components/comuns/alerts/AlerComponent.vue'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'

const router = useRouter()

function navegar(hash) {
  router.push({ path: '/adm/formularios', hash })
}

const modulos = [
  {
    titulo: 'Formulários',
    icone: 'mdi-text-box-multiple-outline',
    cor: 'primary',
    hash: '#formularios',
    descricao: 'Cadastro de formulários dinâmicos que agrupam campos configuráveis para uso nos processos.',
  },
  {
    titulo: 'Campos',
    icone: 'mdi-form-textbox',
    cor: 'indigo',
    hash: '#campos',
    descricao: 'Biblioteca de campos reutilizáveis com configuração de tipo, máscara, validação e placeholder.',
  },
  {
    titulo: 'Regras de Campos',
    icone: 'mdi-code-braces',
    cor: 'teal',
    hash: '#regras-campos',
    descricao: 'Definição de regras condicionais que controlam visibilidade e comportamento dos campos nos formulários.',
  },
]
</script>

<style scoped>
.formulario-overview {
  background: rgb(var(--v-theme-background));
  min-height: 100%;
}

.max-width-container {
  max-width: 1280px;
  margin: 0 auto;
}

.modulo-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.22s ease;
  height: 100%;
}

.modulo-card--clicavel {
  cursor: pointer;
}

.modulo-card--clicavel:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.10);
  transform: translateY(-3px);
}

.modulo-card--clicavel:hover .seta-acesso {
  transform: translateX(4px);
  opacity: 1;
}

.seta-acesso {
  opacity: 0.4;
  transition: transform 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
}
</style>
