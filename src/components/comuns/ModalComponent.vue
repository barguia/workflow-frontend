<template>
  <div>
    <!-- Botão para abrir a modal -->
    <v-btn color="primary" @click="showDialog = true">Abrir Modal</v-btn>

    <!-- Modal com VDialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          Título da Modal
          <v-spacer />
          <v-btn icon @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          Este é o conteúdo da modal.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="showDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: "ModalComponent",
  setup() {
    const showDialog = ref(false)
    return {showDialog}
  }
}
</script>