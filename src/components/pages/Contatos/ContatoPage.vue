<template>
  <div>
    <section class="py-16" style="background-color: #2563eb;" id="contatos">
      <v-container class="text-center text-white">
        <h2 class="text-h4 font-weight-bold mb-6 fade-in">Vamos Conversar Sobre Seu Projeto?</h2>
        <p class="text-h6 mb-6">Descreva sua necessidade e receba uma proposta personalizada em 48h.</p>
        <v-form ref="form" lazy-validation class="max-w-lg mx-auto" @submit.prevent="handleSubmit">
          <v-text-field
              v-model="nome"
              label="Nome"

              outlined
              dense
              class="mb-4"
              :error-messages="validationErrors.nome"
          />

          <v-text-field
              v-model="email"
              label="Email"

              outlined
              dense
              class="mb-4"
              :error-messages="validationErrors.email"
          />

          <v-text-field
              v-model="telefone"
              label="Telefone"

              outlined
              dense
              class="mb-4"
              :error-messages="validationErrors.telefone"
          />

          <v-text-field
              v-model="assunto"
              label="Assunto"

              outlined
              dense
              class="mb-4"
              autocomplete="off"
              :error-messages="validationErrors.assunto"
          />

          <v-textarea
              v-model="mensagem"
              label="Descreva seu projeto"

              outlined
              dense
              class="mb-4"
              autocomplete="off"
              :error-messages="validationErrors.mensagem"
          />

          <v-btn color="white" text @click="handleSubmit">Enviar</v-btn>
        </v-form>

        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="3000"
          location="top right"
          :close-on-content-click="true"
          class="snackbar-responsive"
        >
          {{ snackbar.message }}
        </v-snackbar>

        <p class="mt-6">Contato: <a href="mailto:auriweb@gmail.com" class="nav-link hover:text-blue-300">auriweb@gmail.com</a> | (19) 99532-3907 | Americana, SP</p>
      </v-container>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useReCaptcha } from 'vue-recaptcha-v3';
import api from '@/services/api';
import { useValidationErrors } from '@/composables/useValidationErrors';
export default {
  name: 'ContatoPage',
  setup() {
    const nome = ref('');
    const email = ref('');
    const assunto = ref('');
    const mensagem = ref('');
    const telefone = ref('');
    const isFormValid = ref(false);
    const { validationErrors } = useValidationErrors();
    const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success',
    });

    const resetForm = () => {
      nome.value = '';
      email.value = '';
      assunto.value = '';
      mensagem.value = '';
      telefone.value = '';
    };

    const submitForm = () => {
      if (isFormValid.value) {
        alert('Formulário enviado com sucesso!');
        // Aqui você pode adicionar o código para processar o formulário (ex.: enviar para uma API)
      }
    };

    const handleSubmit = async () => {
      try {
        // Aguarda o reCAPTCHA carregar (opcional, mas recomendado)
        await recaptchaLoaded();

        // Executa o reCAPTCHA com uma ação personalizada (ex: 'login')
        const token = await executeRecaptcha('send_email');

        // Envia os dados + token para o backend via Axios
        await api.post('/send-email', {
          nome: nome.value,
          email: email.value,
          assunto: assunto.value,
          mensagem: mensagem.value,
          telefone: telefone.value,
          'g-recaptcha-response': token,
        });

        // console.log('Sucesso:', response.data);
        snackbar.value = {
          show: true,
          message: 'Formulário enviado com sucesso!',
          color: 'success',
        };

        resetForm()
        validationErrors.value = {}
      } catch (error) {
        snackbar.value = {
          show: true,
          message: 'Erro ao enviar o formulário. Tente novamente mais tarde.',
          color: 'error',
        };
      }
    };

    return {
      nome,
      email,
      assunto,
      mensagem,
      telefone,
      isFormValid,
      submitForm,
      handleSubmit,
      snackbar,
      validationErrors,
    };
  },
};
</script>

<style scoped>
.pa-5 {
  padding: 20px;
}

/* Estilo padrão: botão à direita da mensagem */
.snackbar-actions {
  display: flex;
  justify-content: flex-end;
}

/* Estilo responsivo para o snackbar */
.snackbar-responsive {
  z-index: 10000 !important; /* Acima do v-overlay (z-index: 9999) */
}

/* Telas grandes (>600px): margens maiores */
@media (min-width: 600px) {
  .snackbar-responsive {
    margin: 24px !important; /* 24px de margem em telas grandes */
  }
  .snackbar-actions {
    display: flex;
    justify-content: flex-end;
  }
}

/* Telas pequenas (≤600px): margens menores e botão abaixo */
@media (max-width: 600px) {
  .snackbar-responsive {
    margin: 12px !important; /* 12px de margem em telas pequenas */
  }
  .snackbar-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
  }
}
</style>
