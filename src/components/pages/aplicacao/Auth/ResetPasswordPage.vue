<script setup>

import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import {useRoute} from "vue-router";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import {ref} from "vue";
import {authService} from "@/services/authService.js";


const route = useRoute()
const router = useRoute()

const password = ref('');
const password_confirmation = ref('');

async function trocarPassword() {
  try {
    const data = await authService.resetPassword({
      password: password.value,
      password_confirmation: password.value,
      token: route.query.token ?? '',
      email: route.query.email ?? '',
    })
    window.dispatchEvent(
        new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: data.message,
          },
        }));
    console.log(data)
    router.push('/login');
  } catch (err) {
    console.log(err)
  }

}
</script>

<template>
  <ContainerComponent>
    <RowComponent justify="center" align="center">
    <ColComponent cols="12" sm="8" md="6" lg="4">
      <CardComponent class="pa-6">
          <CardTitleComponent class="text-h4 text-center mb-6">Reset Password</CardTitleComponent>
          <CardTextComponent class="text-h4 text-center mb-6">
            <FormComponent class="pa-6" @submit.prevent="trocarPassword">
              <TextFieldComponent
                  v-model="password"
                  label="Senha"
                  type="password"
                  prepend-inner-icon="mdi-lock"
                  required
                  class="mb-4"
              />

              <TextFieldComponent
                  v-model="password_confirmation"
                  label="Senha"
                  type="password"
                  prepend-inner-icon="mdi-lock"
                  required
                  class="mb-4"

              />
              <RowComponent justify="space-between" class="mb-4">
                <ColComponent cols="auto">
                  <RouterLink to="/login">
                    <ButtonComponent
                        variant="text"
                        color="primary"
                    >
                      Voltar para login
                    </ButtonComponent>
                  </RouterLink>
                </ColComponent>
                <ColComponent cols="auto">
                  <ButtonComponent
                      color="primary"
                      type="submit"

                      @click="trocarPassword()"
                  >
                    Trocar senha
                  </ButtonComponent>
                </ColComponent>
              </RowComponent>
            </FormComponent>
          </CardTextComponent>
        </CardComponent>
      </ColComponent>
    </RowComponent>

  </ContainerComponent>
</template>

<style scoped>

</style>