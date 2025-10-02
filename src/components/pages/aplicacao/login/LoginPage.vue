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
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="emailRules"
                    required
                    class="mb-4"
                ></v-text-field>
                <v-text-field
                    v-model="password"
                    label="Senha"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    :rules="passwordRules"
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
import { ref } from 'vue'

// Dados reativos
const email = ref('')
const password = ref('')
const loading = ref(false)

// Regras de validação
const emailRules = [
  v => !!v || 'Email é obrigatório',
  v => /.+@.+\..+/.test(v) || 'Email deve ser válido'
]
const passwordRules = [
  v => !!v || 'Senha é obrigatória',
  v => v.length >= 6 || 'Senha deve ter pelo menos 6 caracteres'
]

// Funções de ação
const handleLogin = async () => {
  loading.value = true
  // Simule uma chamada de API aqui
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('Login realizado com:', { email: email.value, password: password.value })
  loading.value = false
  // Redirecione ou trate o sucesso aqui
}

const handleForgotPassword = () => {
  // Redirecione para página de recuperação de senha
  console.log('Navegar para esqueci a senha')
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>