<template>
  <CrudComponent
      route="wf/forms/formularios"
      title="Formulários"
      must-sort
      :fields="fields"
      :headers="headers"
      :show-select="false"
      data-testid="formulario-crud"
  >
    <template #actionsField="{ item }">
      <ButtonComponent
          icon="mdi-eye-outline"
          variant="text"
          size="small"
          color="secondary"
          title="Visualizar formulário"
          data-testid="formulario-btn-preview"
          @click="abrirPreview(item)"
      />
      <ButtonComponent
          icon="mdi-format-list-checks"
          variant="text"
          size="small"
          color="primary"
          title="Associar campos"
          data-testid="formulario-btn-campos"
          @click="abrirModalCampos(item)"
      />
      <ButtonComponent
          icon="mdi-tune"
          variant="text"
          size="small"
          color="teal"
          title="Configurar campos associados"
          data-testid="formulario-btn-pivot"
          @click="abrirModalPivot(item)"
      />
    </template>
  </CrudComponent>

  <UmParaMuitosComponent2
      v-if="dialog"
      v-model="dialog"
      :titulo="`Campos do formulário: ${formularioSelecionado?.formulario}`"
      :entidade-id="formularioSelecionado?.id"
      endpoint-api="wf/forms/formularios-campos"
      campo-entidade-id="ctrl_formulario_id"
      campo-ids-associados="campos_ids"
      :selecionados="camposSelecionados"
      :todos-itens="todosCampos"
      @salvo="fecharModal"
  />

  <PreviewFormularioDialog
      v-if="dialogPreview"
      v-model="dialogPreview"
      :formulario="formularioSelecionado"
  />

  <!-- Dialog de configuração do pivot -->
  <v-dialog v-model="dialogPivot" max-width="900px" scrollable @keydown.esc="dialogPivot = false" @before-leave="() => document.activeElement?.blur()">
    <CardComponent rounded="lg">

      <!-- Título -->
      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="teal" size="22">mdi-tune</IconComponent>
        <div>
          <div class="text-h6 lh-sm">Configurar campos</div>
          <div class="text-caption text-medium-emphasis">{{ formularioSelecionado?.formulario }}</div>
        </div>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="dialogPivot = false" />
      </CardTitleComponent>

      <!-- Toolbar de busca -->
      <div v-if="!carregandoPivot && camposPivot.length" class="px-5 py-3 border-b d-flex align-center gap-3">
        <v-text-field
            v-model="busca"
            density="compact"
            hide-details
            placeholder="Buscar campo..."
            prepend-inner-icon="mdi-magnify"
            clearable
            style="max-width:300px"
        />
        <v-chip size="small" variant="tonal" color="teal">
          {{ camposFiltrados.length }} {{ camposFiltrados.length === 1 ? 'campo' : 'campos' }}
        </v-chip>
      </div>

      <!-- Lista (accordion) -->
      <CardTextComponent class="pa-0" style="max-height:520px; overflow-y:auto">
        <ProgressLinearComponent v-if="carregandoPivot" indeterminate color="teal" />

        <p v-else-if="camposPivot.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo associado a este formulário.
        </p>

        <p v-else-if="camposFiltrados.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo encontrado para "<strong>{{ busca }}</strong>".
        </p>

        <v-expansion-panels v-else multiple variant="accordion" class="rounded-0">
          <v-expansion-panel
              v-for="campo in camposFiltrados"
              :key="campo.pivot.id"
              elevation="0"
          >
            <!-- Cabeçalho do painel -->
            <v-expansion-panel-title class="px-5 py-3">
              <div class="d-flex align-center gap-3 flex-grow-1 mr-4 min-width-0">
                <v-chip size="x-small" variant="tonal" color="teal" class="flex-shrink-0">{{ campo.tipo }}</v-chip>
                <div class="min-width-0">
                  <div class="text-body-2 font-weight-medium text-truncate">{{ campo.label }}</div>
                  <div class="text-caption text-medium-emphasis text-truncate">{{ campo.campo }}</div>
                </div>
              </div>
              <div class="d-flex align-center gap-1 flex-shrink-0 mr-2" @click.stop>
                <span class="text-caption text-medium-emphasis">Obrigatório</span>
                <v-switch
                    v-model="campo.pivot.obrigatorio"
                    :true-value="1"
                    :false-value="0"
                    hide-details
                    density="compact"
                    color="teal"
                />
              </div>
            </v-expansion-panel-title>

            <!-- Conteúdo do painel -->
            <v-expansion-panel-text>
              <div class="pt-1 pb-3">

                <!-- Campos comuns -->
                <v-row dense>
                  <v-col cols="6" md="2">
                    <TextFieldComponent
                        v-model.number="campo.pivot.cols"
                        label="Cols"
                        density="compact"
                        hide-details
                        type="number"
                        min="1"
                        max="12"
                    />
                  </v-col>
                  <v-col cols="6" md="2">
                    <TextFieldComponent
                        v-model.number="campo.pivot.ordem"
                        label="Ordem"
                        density="compact"
                        hide-details
                        type="number"
                    />
                  </v-col>
                  <v-col cols="12" :md="campo.tipo === 'select' ? 5 : 8">
                    <TextFieldComponent
                        v-model="campo.pivot.valor_default"
                        label="Valor padrão"
                        density="compact"
                        hide-details
                    />
                  </v-col>
                  <v-col v-if="campo.tipo === 'select'" cols="12" md="3" class="d-flex align-center">
                    <v-checkbox
                        v-model="campo.pivot.select_multiplo"
                        :true-value="1"
                        :false-value="0"
                        label="Seleção múltipla"
                        hide-details
                        density="compact"
                        color="teal"
                    />
                  </v-col>
                </v-row>

                <!-- Avançado: range -->
                <template v-if="campo.tipo === 'range'">
                  <v-divider class="my-4" />
                  <div class="d-flex align-center gap-2 mb-3">
                    <v-icon size="15" color="teal">mdi-tune-variant</v-icon>
                    <span class="text-caption font-weight-medium text-uppercase" style="letter-spacing:.06em; opacity:.6">Limites do intervalo</span>
                  </div>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <TextFieldComponent
                          v-model.number="campo.pivot.range_minimo"
                          label="Mínimo"
                          density="compact"
                          hide-details
                          type="number"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <TextFieldComponent
                          v-model.number="campo.pivot.range_maximo"
                          label="Máximo"
                          density="compact"
                          hide-details
                          type="number"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <TextFieldComponent
                          v-model.number="campo.pivot.range_step"
                          label="Step"
                          density="compact"
                          hide-details
                          type="number"
                      />
                    </v-col>
                  </v-row>
                </template>

                <!-- Avançado: switch -->
                <template v-if="campo.tipo === 'switch'">
                  <v-divider class="my-4" />
                  <div class="d-flex align-center gap-2 mb-3">
                    <v-icon size="15" color="teal">mdi-toggle-switch-outline</v-icon>
                    <span class="text-caption font-weight-medium text-uppercase" style="letter-spacing:.06em; opacity:.6">Rótulos e valores</span>
                  </div>
                  <v-row dense>
                    <v-col cols="12" md="3">
                      <TextFieldComponent
                          v-model="campo.pivot.switch_true_label"
                          label="Label ativo"
                          placeholder="Sim"
                          density="compact"
                          hide-details
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <TextFieldComponent
                          v-model="campo.pivot.switch_false_label"
                          label="Label inativo"
                          placeholder="Não"
                          density="compact"
                          hide-details
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <TextFieldComponent
                          v-model="campo.pivot.switch_true_value"
                          label="Valor ativo"
                          placeholder="true"
                          density="compact"
                          hide-details
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <TextFieldComponent
                          v-model="campo.pivot.switch_false_value"
                          label="Valor inativo"
                          placeholder="false"
                          density="compact"
                          hide-details
                      />
                    </v-col>
                  </v-row>
                </template>

              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </CardTextComponent>

      <!-- Footer -->
      <div class="border-t bg-grey-lighten-5 px-5 py-3 d-flex align-center gap-3">
        <v-icon size="15" color="medium-emphasis">mdi-information-outline</v-icon>
        <span class="text-caption text-medium-emphasis flex-grow-1">Alterações só serão aplicadas após salvar</span>
        <ButtonComponent variant="text" @click="dialogPivot = false">Cancelar</ButtonComponent>
        <ButtonComponent
            variant="flat"
            color="teal"
            prepend-icon="mdi-content-save-outline"
            :loading="salvandoTodos"
            @click="salvarTodosPivots"
        >
          Salvar tudo
        </ButtonComponent>
      </div>

    </CardComponent>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import CrudComponent from '@/components/crud/CrudComponent.vue'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'
import PreviewFormularioDialog from './PreviewFormularioDialog.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import api from '@/services/api.js'

const dialog = ref(false)
const dialogPreview = ref(false)
const dialogPivot = ref(false)
const formularioSelecionado = ref(null)
const camposSelecionados = ref([])
const todosCampos = ref([])
const camposPivot = ref([])
const carregandoPivot = ref(false)
const salvandoTodos = ref(false)
const busca = ref('')

const camposFiltrados = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return camposPivot.value
  return camposPivot.value.filter(c =>
    c.label?.toLowerCase().includes(q) ||
    c.campo?.toLowerCase().includes(q) ||
    c.tipo?.toLowerCase().includes(q)
  )
})

const fields = [
  {
    key: 'formulario',
    label: 'Formulário',
    type: 'text',
    rules: [v => !!v || 'Formulário é obrigatório'],
    optional: false,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    type: 'textarea',
    optional: true,
  },
]

const headers = [
  { title: 'Formulário', value: 'formulario', key: 'formulario' },
  { title: 'Descrição',  value: 'descricao',  key: 'descricao'  },
  { title: '',           value: 'actions'                        },
]

const abrirPreview = (formulario) => {
  formularioSelecionado.value = formulario
  dialogPreview.value = true
}

const abrirModalCampos = async (formulario) => {
  const [resTodos, resAssociados] = await Promise.all([
    api.get('wf/forms/campos'),
    api.get(`wf/forms/formularios-campos/${formulario.id}`),
  ])

  const grupos = []
  for (const c of resTodos.data.data) {
    const nomeGrupo = c.grupo || 'Sem grupo'
    let grupo = grupos.find(g => g.grupo === nomeGrupo)
    if (!grupo) {
      grupo = { grupo: nomeGrupo, options: [] }
      grupos.push(grupo)
    }
    grupo.options.push({ value: c.id, text: c.campo })
  }
  grupos.sort((a, b) => a.grupo.localeCompare(b.grupo))
  todosCampos.value = grupos

  camposSelecionados.value = resAssociados.data.data.map(c => c.id)
  formularioSelecionado.value = formulario
  dialog.value = true
}

const fecharModal = () => {
  dialog.value = false
  setTimeout(() => { formularioSelecionado.value = null }, 300)
}

const abrirModalPivot = async (formulario) => {
  formularioSelecionado.value = formulario
  camposPivot.value = []
  carregandoPivot.value = true
  dialogPivot.value = true
  try {
    const res = await api.get(`wf/forms/formularios-campos/${formulario.id}`)
    camposPivot.value = res.data.data ?? []
  } finally {
    carregandoPivot.value = false
  }
}

const salvarTodosPivots = async () => {
  salvandoTodos.value = true
  try {
    await Promise.all(
      camposPivot.value.map(campo =>
        api.put(`wf/forms/formularios-campos/${campo.pivot.id}`, {
          id:                 campo.pivot.id,
          cols:               campo.pivot.cols,
          ordem:              campo.pivot.ordem,
          valor_default:      campo.pivot.valor_default,
          select_multiplo:    campo.pivot.select_multiplo,
          obrigatorio:        campo.pivot.obrigatorio,
          range_minimo:       campo.pivot.range_minimo,
          range_maximo:       campo.pivot.range_maximo,
          range_step:         campo.pivot.range_step,
          switch_true_label:  campo.pivot.switch_true_label,
          switch_false_label: campo.pivot.switch_false_label,
          switch_true_value:  campo.pivot.switch_true_value,
          switch_false_value: campo.pivot.switch_false_value,
        })
      )
    )
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { type: 'success', message: 'Configurações salvas com sucesso!' },
    }))
    dialogPivot.value = false
  } finally {
    salvandoTodos.value = false
  }
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }
.lh-sm { line-height: 1.2; }

/* Remove padding padrão do v-expansion-panel-text */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 20px;
}
</style>
