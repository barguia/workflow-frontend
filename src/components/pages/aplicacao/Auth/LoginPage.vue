<template>
  <ContainerComponent>
    <RowComponent justify="center" align="center">
      <ColComponent cols="12" sm="8" md="6" lg="4">
        <CardComponent class="pa-6">
          <CardTitleComponent class="text-h4 text-center mb-6">
            Login
          </CardTitleComponent>
          <v-form @submit.prevent="login">
            <TextFieldComponent
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              required
              class="mb-4"
            />
            <TextFieldComponent
              v-model="password"
              label="Senha"
              type="password"
              prepend-inner-icon="mdi-lock"
              required
              class="mb-4"
            />
            <RowComponent justify="space-between" class="mb-4">
              <ColComponent cols="auto">
                <RouterLink to="/forgot-password">
                  <ButtonComponent
                      variant="text"
                      color="primary"
                      @click="handleForgotPassword"
                  >
                    Esqueci a senha
                  </ButtonComponent>
                </RouterLink>
              </ColComponent>
              <ColComponent cols="auto">
                <ButtonComponent
                    color="primary"
                    type="submit"
                    :loading="loading"
                >
                  Efetuar Login
                </ButtonComponent>
              </ColComponent>
            </RowComponent>
          </v-form>
        </CardComponent>
      </ColComponent>
    </RowComponent>
  </ContainerComponent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import {useNotifications} from "@/composables/useNotifications.js";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";


const authStore = useAuthStore();
const router = useRouter();
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(false)
const { triggerNotification } = useNotifications();

const handleForgotPassword = () => {
  console.log('Navegar para esqueci a senha')
}

onMounted(() => {
  console.log(authStore.isAuthenticated)
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});
async function login() {

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    // triggerNotification({ message: 'Login realizado com sucesso!', type: 'success' });
    window.dispatchEvent(
        new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: 'Login realizado com sucesso!',
          },
        }));

    if (authStore.isAuthenticated) {
      router.push('/');
    }

  } catch (err) {
    error.value = err.response?.data?.message || 'Erro no login';
    console.error('Erro:', err);
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>