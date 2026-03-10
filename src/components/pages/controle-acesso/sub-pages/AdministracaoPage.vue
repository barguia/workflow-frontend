<template>
  <div class="admin-overview">
    <v-container fluid class="py-8 py-md-12">
      <div class="max-width-container">

        <div class="mb-10">
          <h1 class="text-h4 font-weight-medium text-center">
            Central de Administração e Governança
          </h1>
          <p class="text-body-1 mt-4" style="max-width: 960px;">
            Área restrita destinada à configuração global da plataforma. Aqui são definidos os parâmetros de segurança,
            controle de acesso, estrutura organizacional e políticas de uso que regem todo o sistema.
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
                <v-icon :color="modulo.cor" size="36" class="mt-1">{{ modulo.icone }}</v-icon>

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <h3 class="text-h6 font-weight-medium">{{ modulo.titulo }}</h3>
                    <v-icon
                      v-if="modulo.hash"
                      size="18"
                      class="seta-acesso"
                      color="primary"
                    >
                      mdi-arrow-right
                    </v-icon>
                  </div>
                  <p class="text-body-2 mb-0" style="line-height: 1.6;">{{ modulo.descricao }}</p>
                </div>
              </div>
            </div>
          </ColComponent>
        </RowComponent>

        <v-divider class="my-10" />

        <AlertComponent
          border="start"
          border-color="warning"
          variant="tonal"
          class="max-width-container"
          prominent
          icon="mdi-shield-lock-outline"
        >
          <strong>Atenção:</strong> As alterações realizadas nesta seção possuem impacto imediato em todo o ambiente.
          Recomenda-se que apenas administradores com perfil técnico elevado e autorização expressa realizem configurações.
        </AlertComponent>

      </div>
    </v-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import RowComponent from '@/components/comuns/layout/RowComponent.vue'
import ColComponent from '@/components/comuns/layout/ColComponent.vue'
import AlertComponent from '@/components/comuns/alerts/AlerComponent.vue'

const router = useRouter()

function navegar(hash) {
  router.push({ path: '/administracao', hash })
}

const modulos = [
  {
    titulo: 'Empresas',
    icone: 'mdi-domain',
    cor: 'blue-grey',
    hash: '#organizacoes',
    descricao: 'Cadastro e manutenção das organizações que utilizam a plataforma, incluindo estrutura hierárquica e configurações específicas por empresa.',
  },
  {
    titulo: 'Usuários',
    icone: 'mdi-account-tie',
    cor: 'indigo',
    hash: '#usuarios',
    descricao: 'Gerenciamento completo do ciclo de vida dos usuários: criação, ativação, bloqueio, redefinição de senhas e histórico de acesso.',
  },
  {
    titulo: 'Perfis de Acesso',
    icone: 'mdi-shield-account-outline',
    cor: 'deep-purple',
    hash: '#perfis',
    descricao: 'Definição de papéis funcionais com associação granular de permissões, permitindo controle preciso sobre funcionalidades disponíveis.',
  },
  {
    titulo: 'Permissões Personalizadas',
    icone: 'mdi-key-chain',
    cor: 'purple',
    hash: '#permissoes',
    descricao: 'Criação e gestão de permissões específicas que podem ser combinadas dinamicamente em perfis ou atribuídas diretamente a usuários.',
  },
  {
    titulo: 'Menus',
    icone: 'mdi-menu-open',
    cor: 'teal',
    hash: '#menus',
    descricao: 'Configuração da estrutura de navegação da aplicação, incluindo hierarquia de menus, ícones e controle de visibilidade por perfil.',
  },
  {
    titulo: 'Auditoria e Logs',
    icone: 'mdi-text-box-search-outline',
    cor: 'brown',
    hash: null,
    descricao: 'Registro detalhado de todas as ações críticas realizadas no sistema, com possibilidade de exportação e filtros avançados.',
  },
]
</script>

<style scoped>
.admin-overview {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
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
