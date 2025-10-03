<template>
  <v-app>
    <v-main class="fill-height">
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-6">
              <v-card-title class="text-h4 text-center mb-6">
                Login
              </v-card-title>
              <v-form @submit.prevent="login">
                <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    required
                    class="mb-4"
                ></v-text-field>
                <v-text-field
                    v-model="password"
                    label="Senha"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    required
                    class="mb-4"
                ></v-text-field>
                <v-row justify="space-between" class="mb-4">
                  <v-col cols="auto">
                    <v-btn
                        variant="text"
                        color="primary"
                        @click="handleForgotPassword"
                    >
                      Esqueci a senha
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="loading"
                    >
                      Efetuar Login
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import {useNotifications} from "@/composables/useNotifications.js";


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
    router.push('/');
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