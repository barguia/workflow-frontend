<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-data-table
            v-model="selected"
            :headers="headers"
            :items="users"
            :items-per-page="10"
            show-select
            class="elevation-1"
            item-key="id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Lista de Usuários</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Buscar"
                  single-line
                  hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editUser(item)">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-container>

      <!-- Botão de Adicionar Novo Usuário -->
      <v-btn
          color="primary"
          fab
          dark
          fixed
          bottom
          right
          @click="openAddModal"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <!-- Modal para Adicionar/Editar Usuário -->
      <v-dialog v-model="dialog" max-width="600px" @keydown.esc="closeModal">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? 'Editar Usuário' : 'Adicionar Usuário' }}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                  v-model="form.name"
                  label="Nome"
                  :rules="nameRules"
                  required
              ></v-text-field>
              <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="emailRules"
                  required
              ></v-text-field>
              <v-text-field
                  v-model="form.phone"
                  label="Telefone (opcional)"
                  :rules="phoneRules"
              ></v-text-field>
              <v-text-field
                  v-model="form.birthDate"
                  label="Data de Nascimento"
                  type="date"
                  :rules="dateRules"
                  required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeModal">
              Cancelar
            </v-btn>
            <v-btn v-if="isEditing" color="warning" text @click="resetPassword">
              Resetar Senha
            </v-btn>
            <v-btn color="primary" text @click="saveUser">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Dados reativos
const users = ref([])
const selected = ref([])
const search = ref('')
const dialog = ref(false)
const isEditing = ref(false)
const valid = ref(false)
const form = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  birthDate: ''
})

// Regras de validação
const nameRules = [v => !!v || 'Nome é obrigatório']
const emailRules = [
  v => !!v || 'Email é obrigatório',
  v => /.+@.+\..+/.test(v) || 'Email deve ser válido'
]
const phoneRules = [v => !v || /^\d{10,11}$/.test(v) || 'Telefone deve ser válido (10-11 dígitos)']
const dateRules = [v => !!v || 'Data de Nascimento é obrigatória']

// Cabeçalhos da tabela
const headers = [
  { text: 'Nome', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'Telefone', value: 'phone' },
  { text: 'Data de Nascimento', value: 'birthDate' },
  { text: 'Ações', value: 'actions', sortable: false }
]

// Funções
const openAddModal = () => {
  isEditing.value = false
  form.value = { id: null, name: '', email: '', phone: '', birthDate: '' }
  dialog.value = true
}

const editUser = (user) => {
  isEditing.value = true
  form.value = { ...user }
  dialog.value = true
}

const closeModal = () => {
  dialog.value = false
}

const saveUser = async () => {
  if (!valid.value) return // Validação pendente, mas para simplicidade, assumimos OK
  if (isEditing.value) {
    // Atualizar usuário existente
    const index = users.value.findIndex(u => u.id === form.value.id)
    if (index !== -1) users.value[index] = { ...form.value }
    console.log('Usuário editado:', form.value)
  } else {
    // Adicionar novo
    const newId = users.value.length + 1
    users.value.push({ id: newId, ...form.value })
    console.log('Novo usuário adicionado:', { id: newId, ...form.value })
  }
  closeModal()
}

const resetPassword = () => {
  console.log('Resetando senha para usuário:', form.value.id)
  // Aqui você pode integrar com uma API para resetar senha
}

// Simular dados iniciais
onMounted(() => {
  users.value = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', phone: '11987654321', birthDate: '1990-01-01' },
    { id: 2, name: 'Maria Oliveira', email: 'maria@example.com', phone: '', birthDate: '1985-05-15' }
  ]
})
</script>

<style scoped>
/* Ajustes para mobile: O FAB já é responsivo no Vuetify */
</style>