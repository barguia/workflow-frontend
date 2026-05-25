<template>
  <v-dialog v-model="proxyModel" max-width="1400px" scrollable @keydown.esc="proxyModel = false" @before-leave="() => { document.activeElement?.blur(); campoSelecionado = null }">
    <CardComponent rounded="lg">

      <CardTitleComponent class="d-flex align-center ga-2 py-4 px-6 border-b">
        <IconComponent color="teal" size="22">mdi-tune</IconComponent>
        <div>
          <div class="text-h6 lh-sm">Configurar campos</div>
          <div class="text-caption text-medium-emphasis">{{ formulario?.formulario }}</div>
        </div>
        <SpacerComponent />
        <ButtonComponent icon="mdi-close" variant="text" size="small" @click="proxyModel = false" />
      </CardTitleComponent>

      <div v-if="!carregandoPivot && camposPivot.length" class="px-5 py-3 border-b d-flex align-center gap-3">
        <v-text-field
            v-model="busca"
            data-testid="configuracao-busca"
            density="compact"
            hide-details
            placeholder="Buscar campo..."
            prepend-inner-icon="mdi-magnify"
            clearable
            style="max-width:300px"
        />
        <v-chip data-testid="configuracao-chip-total" size="small" variant="tonal" color="teal">
          {{ camposFiltrados.length }} {{ camposFiltrados.length === 1 ? 'campo' : 'campos' }}
        </v-chip>
      </div>

      <div v-if="campoSelecionado" data-testid="configuracao-painel-edicao" class="border-t">
        <div class="px-5 py-3 border-b d-flex align-center gap-3" style="background: rgba(var(--v-theme-teal), 0.12)">
          <div class="d-flex align-center justify-center rounded" style="width:32px; height:32px; background: rgb(var(--v-theme-teal)); flex-shrink:0">
            <v-icon size="17" color="white">mdi-pencil</v-icon>
          </div>
          <div class="min-width-0 flex-grow-1">
            <div class="text-caption text-medium-emphasis" style="line-height:1.2">Editando campo</div>
            <div data-testid="configuracao-painel-label" class="text-subtitle-2 font-weight-bold text-truncate" style="color: rgb(var(--v-theme-teal))">{{ campoSelecionado.label }}</div>
          </div>
          <v-chip size="small" variant="flat" color="teal" class="flex-shrink-0">{{ campoSelecionado.tipo }}</v-chip>
          <ButtonComponent data-testid="configuracao-painel-fechar" icon="mdi-close" variant="text" size="x-small" @click="campoSelecionado = null" />
        </div>

        <div class="px-5 py-4" style="max-height:260px; overflow-y:auto">
          <v-row dense>
            <v-col cols="6" md="2">
              <TextFieldComponent
                v-model.number="campoSelecionado.pivot.cols"
                label="Cols"
                density="compact"
                hide-details
                type="number"
                min="1"
                max="12"
              />
            </v-col>
            <v-col v-if="!['range', 'switch'].includes(campoSelecionado.tipo)" cols="12" :md="campoSelecionado.tipo === 'select' ? 5 : 8">
              <TextFieldComponent
                v-if="['text', 'number', 'date'].includes(campoSelecionado.tipo)"
                v-model="campoSelecionado.pivot.valor_default"
                label="Valor padrão"
                density="compact"
                :type="tipoInput(campoSelecionado.tipo)"
                :mask="campoSelecionado.mascara || undefined"
              />
              <EmailComponent
                v-else-if="campoSelecionado.tipo === 'email'"
                v-model="campoSelecionado.pivot.valor_default"
                label="Valor padrão"
              />
              <DatetimeComponent
                v-else-if="campoSelecionado.tipo === 'datetime'"
                v-model="campoSelecionado.pivot.valor_default"
                label="Valor padrão"
              />
              <TimeComponent
                v-else-if="campoSelecionado.tipo === 'time'"
                v-model="campoSelecionado.pivot.valor_default"
                label="Valor padrão"
              />
              <TextAreaComponent
                v-else-if="campoSelecionado.tipo === 'textarea'"
                v-model="campoSelecionado.pivot.valor_default"
                label="Valor padrão"
                rows="2"
                auto-grow
              />
              <SelectComponent
                v-else-if="campoSelecionado.tipo === 'select'"
                :model-value="selectDefaultValue(campoSelecionado)"
                :items="camposOpcoes[campoSelecionado.id] ?? []"
                :multiple="campoSelecionado.pivot.select_multiplo === 1"
                label="Valor padrão"
                density="compact"
                @update:model-value="(v) => setSelectDefault(campoSelecionado, v)"
              />
              <RadioComponent
                v-else-if="campoSelecionado.tipo === 'radio'"
                v-model="campoSelecionado.pivot.valor_default"
                :items="camposOpcoes[campoSelecionado.id] ?? []"
                label="Valor padrão"
                inline
              />
              <CheckboxComponent
                v-else-if="campoSelecionado.tipo === 'checkbox'"
                :model-value="checkboxDefaultValue(campoSelecionado)"
                :items="camposOpcoes[campoSelecionado.id] ?? []"
                label="Valor padrão"
                multiple
                inline
                @update:model-value="(v) => setCheckboxDefault(campoSelecionado, v)"
              />
              <AutocompleteComponent
                v-else-if="campoSelecionado.tipo === 'autocomplete'"
                v-model="campoSelecionado.pivot.valor_default"
                :items="camposOpcoes[campoSelecionado.id] ?? []"
                :no-filter="campoSelecionado.opcoes_por_uri === 1"
                label="Valor padrão"
                density="compact"
                @update:search="(s) => camposOnSearch[campoSelecionado.id]?.(s)"
              />
            </v-col>
            <v-col v-if="campoSelecionado.tipo === 'select'" cols="12" md="3" class="d-flex align-center">
              <v-checkbox
                v-model="campoSelecionado.pivot.select_multiplo"
                :true-value="1"
                :false-value="0"
                label="Seleção múltipla"
                hide-details
                density="compact"
                color="teal"
              />
            </v-col>
          </v-row>

          <template v-if="campoSelecionado.tipo === 'range'">
            <v-divider class="my-4" />
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon size="15" color="teal">mdi-tune-variant</v-icon>
              <span class="text-caption font-weight-medium text-uppercase" style="letter-spacing:.06em; opacity:.6">Limites do intervalo</span>
            </div>
            <v-row dense>
              <v-col cols="12" md="4">
                <TextFieldComponent
                  v-model.number="campoSelecionado.pivot.range_minimo"
                  label="Mínimo"
                  density="compact"
                  hide-details
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <TextFieldComponent
                  v-model.number="campoSelecionado.pivot.range_maximo"
                  label="Máximo"
                  density="compact"
                  hide-details
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <TextFieldComponent
                  v-model.number="campoSelecionado.pivot.range_step"
                  label="Step"
                  density="compact"
                  hide-details
                  type="number"
                />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col cols="12">
                <RangeComponent
                  :model-value="campoSelecionado.pivot.valor_default !== null && campoSelecionado.pivot.valor_default !== '' ? Number(campoSelecionado.pivot.valor_default) : (campoSelecionado.pivot.range_minimo ?? 0)"
                  :min="campoSelecionado.pivot.range_minimo ?? 0"
                  :max="campoSelecionado.pivot.range_maximo ?? 100"
                  :step="campoSelecionado.pivot.range_step ?? 1"
                  label="Valor padrão"
                  @update:model-value="(v) => { campoSelecionado.pivot.valor_default = v }"
                />
              </v-col>
            </v-row>
          </template>

          <template v-if="campoSelecionado.tipo === 'switch'">
            <v-divider class="my-4" />
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon size="15" color="teal">mdi-toggle-switch-outline</v-icon>
              <span class="text-caption font-weight-medium text-uppercase" style="letter-spacing:.06em; opacity:.6">Rótulos e valores</span>
            </div>
            <v-row dense>
              <v-col cols="12" md="3">
                <TextFieldComponent
                  v-model="campoSelecionado.pivot.switch_true_label"
                  label="Label ativo"
                  placeholder="Sim"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent
                  v-model="campoSelecionado.pivot.switch_false_label"
                  label="Label inativo"
                  placeholder="Não"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent
                  v-model="campoSelecionado.pivot.switch_true_value"
                  label="Valor ativo"
                  placeholder="true"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent
                  v-model="campoSelecionado.pivot.switch_false_value"
                  label="Valor inativo"
                  placeholder="false"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col cols="12">
                <SwitchComponent
                  v-model="campoSelecionado.pivot.valor_default"
                  label="Valor padrão"
                  :true-label="campoSelecionado.pivot.switch_true_label || 'Ativo'"
                  :false-label="campoSelecionado.pivot.switch_false_label || 'Inativo'"
                  :true-value="campoSelecionado.pivot.switch_true_value || 'true'"
                  :false-value="campoSelecionado.pivot.switch_false_value || 'false'"
                />
              </v-col>
            </v-row>
          </template>
        </div>
        <v-divider/>
      </div>

      <CardTextComponent class="pa-0" style="max-height:320px; overflow-y:auto">
        <ProgressLinearComponent v-if="carregandoPivot" data-testid="configuracao-carregando" indeterminate color="teal" />

        <p v-else-if="camposPivot.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo associado a este formulário.
        </p>

        <p v-else-if="camposFiltrados.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo encontrado para "<strong>{{ busca }}</strong>".
        </p>

        <div v-else class="campos-grid">
          <Draggable
              v-model="camposPivot"
              :item-key="c => c.pivot.id"
              handle=".drag-handle"
              :animation="200"
              :disabled="!!busca"
              ghost-class="drag-ghost"
              tag="div"
              class="d-contents"
              @end="renumerarOrdem"
          >
            <template #item="{ element: campo }">
              <div
                  v-show="campoCorresponde(campo)"
                  data-testid="configuracao-campo-item"
                  class="campo-item"
                  :class="{ 'campo-selecionado': campoSelecionado?.pivot.id === campo.pivot.id }"
                  :style="itemStyle(campo)"
                  @click="selecionarCampo(campo)"
              >
                <div class="d-flex align-center gap-3 px-4 py-3">
                  <v-icon
                      class="drag-handle flex-shrink-0"
                      size="18"
                      :color="busca ? 'disabled' : campoSelecionado?.pivot.id === campo.pivot.id ? 'teal' : 'medium-emphasis'"
                      :style="busca ? 'cursor:default' : 'cursor:grab'"
                      @click.stop
                  >mdi-drag-vertical</v-icon>
                  <v-chip size="x-small" variant="tonal" color="teal" class="flex-shrink-0">{{ campo.tipo }}</v-chip>
                  <div class="min-width-0 flex-grow-1">
                    <div class="text-body-2 font-weight-medium text-truncate">{{ campo.label }}</div>
                    <div class="text-caption text-medium-emphasis text-truncate">{{ campo.campo }}</div>
                  </div>
                  <div class="d-flex flex-column align-center flex-shrink-0" @click.stop>
                    <span class="text-caption text-medium-emphasis" style="line-height:1">Obrigatório</span>
                    <v-switch
                        v-model="campo.pivot.obrigatorio"
                        :true-value="1"
                        :false-value="0"
                        hide-details
                        density="compact"
                        color="teal"
                    />
                  </div>
                  <v-icon
                      class="flex-shrink-0"
                      size="18"
                      :color="campoSelecionado?.pivot.id === campo.pivot.id ? 'teal' : 'medium-emphasis'"
                  >
                    {{ campoSelecionado?.pivot.id === campo.pivot.id ? 'mdi-pencil' : 'mdi-pencil-outline' }}
                  </v-icon>
                </div>
              </div>
            </template>
          </Draggable>
        </div>
      </CardTextComponent>

      <div class="border-t bg-grey-lighten-5 px-5 py-3 d-flex align-center gap-3">
        <v-icon size="15" color="medium-emphasis">mdi-information-outline</v-icon>
        <span class="text-caption text-medium-emphasis flex-grow-1">Alterações só serão aplicadas após salvar</span>
        <ButtonComponent variant="text" @click="proxyModel = false">Cancelar</ButtonComponent>
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
import { ref, computed, onMounted } from 'vue'
import Draggable from 'vuedraggable'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import ButtonComponent from '@/components/comuns/buttons/ButtonComponent.vue'
import IconComponent from '@/components/comuns/icons/IconComponent.vue'
import SpacerComponent from '@/components/comuns/layout/SpacerComponent.vue'
import ProgressLinearComponent from '@/components/comuns/progress/ProgressLinearComponent.vue'
import TextFieldComponent from '@/components/comuns/forms/TextFieldComponent.vue'
import TextAreaComponent from '@/components/comuns/forms/TextAreaComponent.vue'
import SelectComponent from '@/components/comuns/forms/SelectComponent.vue'
import RadioComponent from '@/components/comuns/forms/RadioComponent.vue'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import EmailComponent from '@/components/comuns/forms/EmailComponent.vue'
import DatetimeComponent from '@/components/comuns/forms/DatetimeComponent.vue'
import TimeComponent from '@/components/comuns/forms/TimeComponent.vue'
import RangeComponent from '@/components/comuns/forms/RangeComponent.vue'
import SwitchComponent from '@/components/comuns/forms/SwitchComponent.vue'
import AutocompleteComponent from '@/components/comuns/forms/AutocompleteComponent.vue'
import { debounce } from 'lodash-es'
import api from '@/services/api.js'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  formulario: { type: Object,  required: true },
})

const emit = defineEmits(['update:modelValue'])

const proxyModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const camposPivot     = ref([])
const carregandoPivot = ref(false)
const salvandoTodos   = ref(false)
const busca           = ref('')
const campoSelecionado = ref(null)

const itemStyle = (campo) => {
  const cols = campo.pivot?.cols ?? 12
  const pct = `calc(${cols} / 12 * 100%)`
  return { flexBasis: pct, width: pct, flexGrow: 0, flexShrink: 0 }
}

const selecionarCampo = (campo) => {
  campoSelecionado.value = campoSelecionado.value?.pivot.id === campo.pivot.id ? null : campo
}

const camposFiltrados = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return camposPivot.value
  return camposPivot.value.filter(c =>
    c.label?.toLowerCase().includes(q) ||
    c.campo?.toLowerCase().includes(q) ||
    c.tipo?.toLowerCase().includes(q)
  )
})

const campoCorresponde = (c) => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return true
  return c.label?.toLowerCase().includes(q) ||
    c.campo?.toLowerCase().includes(q) ||
    c.tipo?.toLowerCase().includes(q)
}

const renumerarOrdem = () => {
  camposPivot.value.forEach((c, i) => { c.pivot.ordem = i })
}

const tipoInput = (tipo) => tipo === 'number' ? 'number' : tipo === 'date' ? 'date' : 'text'

const TIPOS_SELECIONAIS = ['select', 'checkbox', 'radio', 'combobox', 'autocomplete']
const camposOpcoes  = ref({})
const camposOnSearch = ref({})

const carregarOpcoesCampos = async (campos) => {
  await Promise.all(
    campos
      .filter(c => TIPOS_SELECIONAIS.includes(c.tipo))
      .map(async (c) => {
        if (c.opcoes_por_uri === 1 && c.opcoes_uri) {
          const fetchOptions = async (search = '') => {
            const params = search ? { [c.opcoes_uri_text]: search } : {}
            const res = await api.get(c.opcoes_uri, { params })
            const list = Array.isArray(res.data?.data) ? res.data.data : []
            return list.map(item => ({
              value: item[c.opcoes_uri_value],
              text:  item[c.opcoes_uri_text],
            }))
          }
          try {
            camposOpcoes.value[c.id] = await fetchOptions()
          } catch {
            camposOpcoes.value[c.id] = []
          }
          if (c.tipo === 'autocomplete') {
            camposOnSearch.value[c.id] = debounce(async (search) => {
              try { camposOpcoes.value[c.id] = await fetchOptions(search) } catch { /* mantém itens atuais */ }
            }, 350)
          }
        } else {
          camposOpcoes.value[c.id] = (c.campos_opcoes ?? [])
            .slice()
            .sort((a, b) =>
              Number(a.ordem) - Number(b.ordem) ||
              a.valor.localeCompare(b.valor) ||
              a.opcao.localeCompare(b.opcao)
            )
            .map(o => ({ value: o.valor, text: o.opcao }))
        }
      })
  )
}

const parseMultipleDefault = (valor) => {
  if (!valor) return []
  try { return JSON.parse(valor) } catch { return valor.split(',').map(s => s.trim()).filter(Boolean) }
}

const checkboxDefaultValue = (campo) => parseMultipleDefault(campo.pivot.valor_default)

const setCheckboxDefault = (campo, values) => {
  campo.pivot.valor_default = values?.length ? JSON.stringify(values) : null
}

const selectDefaultValue = (campo) => {
  const raw = campo.pivot.valor_default
  if (!campo.pivot.select_multiplo) {
    if (campo.opcoes_por_uri === 1 && raw !== null && raw !== '') {
      const n = Number(raw)
      if (Number.isFinite(n)) return n
    }
    return raw
  }
  return parseMultipleDefault(raw)
}

const setSelectDefault = (campo, value) => {
  if (!campo.pivot.select_multiplo) {
    campo.pivot.valor_default = value ?? null
  } else {
    campo.pivot.valor_default = Array.isArray(value) && value.length ? JSON.stringify(value) : null
  }
}

onMounted(async () => {
  carregandoPivot.value = true
  try {
    const res = await api.get(`wf/forms/formularios-campos/${props.formulario.id}`)
    camposPivot.value = (res.data.data ?? []).sort((a, b) => (a.pivot?.ordem ?? 0) - (b.pivot?.ordem ?? 0))
    await carregarOpcoesCampos(camposPivot.value)
  } finally {
    carregandoPivot.value = false
  }
})

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
    proxyModel.value = false
  } finally {
    salvandoTodos.value = false
  }
}
</script>

<style scoped>
.min-width-0 { min-width: 0; }
.lh-sm { line-height: 1.2; }
.d-contents { display: contents; }

.drag-handle { cursor: grab; }
.drag-handle:active { cursor: grabbing; }

:global(.drag-ghost) {
  opacity: 0.45;
  background: rgb(var(--v-theme-teal), 0.06) !important;
}

.campos-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.campo-item {
  box-sizing: border-box;
  cursor: pointer;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background 0.15s ease;
}

.campo-item:hover {
  background: rgba(var(--v-theme-teal), 0.05);
}

.campo-item.campo-selecionado {
  background: rgba(var(--v-theme-teal), 0.14);
  box-shadow: inset 4px 0 0 rgb(var(--v-theme-teal));
}

.campo-item.campo-selecionado .text-body-2 {
  color: rgb(var(--v-theme-teal));
}
</style>
