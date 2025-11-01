<script setup>
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import RowComponent from "@/components/comuns/layout/RowComponent.vue";
import ColComponent from "@/components/comuns/layout/ColComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import CardTitleComponent from "@/components/comuns/cards/CardTitleComponent.vue";
import FormComponent from "@/components/comuns/forms/FormComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import TextFieldComponent from "@/components/comuns/forms/TextFieldComponent.vue";
import ButtonComponent from "@/components/comuns/buttons/ButtonComponent.vue";
import {authService} from "@/services/authService.js"
import {ref} from "vue";

const email = ref(null)
async function enviaEmail () {
  try {
    const data =  await authService.forgotPassword({email: email.value})
    window.dispatchEvent(
        new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: data.message,
          },
        }));
  } catch (err) {
    window.dispatchEvent(
        new CustomEvent('notification', {
          detail: {
            type: 'error',
            message: err.error,
          },
        }));
    console.error('Erro:', err);
  }
}

</script>

<template>
  <ContainerComponent>
    <RowComponent justify="center" align="center">
      <ColComponent cols="12" sm="8" md="6" lg="4">
        <CardComponent class="pa-6">
          <CardTitleComponent class="text-h5 text-center mb-6">
            Esqueci minha senha
          </CardTitleComponent>
          <CardTextComponent>
            <FormComponent ref="formRef" v-model="valid" lazy-validation>
              <TextFieldComponent
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                required
                class="mb-4"
              />

              <RowComponent justify="space-between" class="mb-4">
                <ColComponent cols="auto">
                  <ButtonComponent
                      variant="text"
                      color="primary"
                      @click="enviaEmail()"
                  >
                    Continuar
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