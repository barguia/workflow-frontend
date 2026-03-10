<template>
  <div class="admin-overview">
    <v-container fluid class="py-8 py-md-12">
      <div class="max-width-container">
        <div class="mb-10">
          <h1 class="text-h4 font-weight-medium text-grey-darken-3 text-center">
            Central de Administração e Governança
          </h1>
          <p class="text-body-1 text-grey-darken-2 mt-4" style="max-width: 960px;">
            Área restrita destinada à configuração global da plataforma. Aqui são definidos os parâmetros de segurança,
            controle de acesso, estrutura organizacional e políticas de uso que regem todo o sistema.
          </p>
        </div>


        <RowComponent class="mt-8">
          <ColComponent v-for="modulo in modulos" :key="modulo.titulo" cols="12" md="6" lg="4">
            <div class="modulo-card pa-6">
              <div class="d-flex align-start ga-4">
                <IconComponent
                    size="36"
                    :color="modulo.cor"
                    class="mt-1"
                >
                  {{ modulo.icone }}
                </IconComponent>

                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-medium text-grey-darken-4 mb-2">
                    {{ modulo.titulo }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1 mb-0" style="line-height: 1.6;">
                    {{ modulo.descricao }}
                  </p>
                </div>
              </div>
            </div>
          </ColComponent>
        </RowComponent>


        <v-divider class="my-10"></v-divider>

        <AlertComponent
            border="start"
            border-color="grey-darken-1"
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
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import IconComponent from "@/components/comuns/icons/IconComponent.vue";
import AlertComponent from "@/components/comuns/alerts/AlerComponent.vue";

const modulos = [
  {
    titulo: 'Empresas',
    icone: 'mdi-domain',
    cor: 'blue-grey',
    descricao: 'Cadastro e manutenção das organizações que utilizam a plataforma, incluindo estrutura hierárquica e configurações específicas por empresa.'
  },
  {
    titulo: 'Usuários',
    icone: 'mdi-account-tie',
    cor: 'blue-grey darken-1',
    descricao: 'Gerenciamento completo do ciclo de vida dos usuários: criação, ativação, bloqueio, redefinição de senhas e histórico de acesso.'
  },
  {
    titulo: 'Perfis de Acesso',
    icone: 'mdi-shield-account-outline',
    cor: 'indigo',
    descricao: 'Definição de papéis funcionais com associação granular de permissões, permitindo controle preciso sobre funcionalidades disponíveis.'
  },
  {
    titulo: 'Permissões Personalizadas',
    icone: 'mdi-key-chain',
    cor: 'deep-purple',
    descricao: 'Criação e gestão de permissões específicas que podem ser combinadas dinamicamente em perfis ou atribuídas diretamente a usuários.'
  },
  {
    titulo: 'Parâmetros do Sistema',
    icone: 'mdi-cog-outline',
    cor: 'grey darken-2',
    descricao: 'Configurações globais da aplicação, regras de negócio, políticas de senha, integração com serviços externos e comportamento geral.'
  },
  {
    titulo: 'Auditoria e Logs',
    icone: 'mdi-text-box-search-outline',
    cor: 'brown',
    descricao: 'Registro detalhado de todas as ações críticas realizadas no sistema, com possibilidade de exportação e filtros avançados.'
  }
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
  transition: all 0.25s ease;
  height: 100%;
}

.modulo-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-2px);
}
</style>