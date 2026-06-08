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
            style="max-width:240px"
        />
        <v-chip data-testid="configuracao-chip-total" size="small" variant="tonal" color="teal">
          {{ camposFiltrados.length }} {{ camposFiltrados.length === 1 ? 'campo' : 'campos' }}
        </v-chip>
        <div class="d-flex align-center gap-3 ml-auto">
          <span class="d-flex align-center gap-1 text-caption text-medium-emphasis mr-3">
            <span class="legend-dot legend-dot--obrigatorio mr-1"></span> Obrigatório
          </span>
          <span class="d-flex align-center gap-1 text-caption text-medium-emphasis">
            <span class="legend-dot legend-dot--opcional mr-1"></span> Opcional
          </span>
        </div>
      </div>

      <div v-if="campoSelecionado" data-testid="configuracao-painel-edicao" class="edit-panel border-b">
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="text-caption text-medium-emphasis edit-label-upper">Editando campo</div>
            <div data-testid="configuracao-painel-label" class="text-subtitle-2 font-weight-bold" style="color:rgb(var(--v-theme-teal))">{{ campoSelecionado.label }}</div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip size="small" variant="flat" color="teal">{{ campoSelecionado.tipo }}</v-chip>
            <ButtonComponent data-testid="configuracao-painel-fechar" icon="mdi-close" variant="text" size="x-small" @click="campoSelecionado = null" />
          </div>
        </div>

        <div style="max-height:220px; overflow-y:auto">
          <div class="d-flex align-start gap-5 flex-wrap">
            <div>
              <div data-testid="configuracao-painel-largura" class="text-caption text-medium-emphasis mb-1">Largura no grid</div>
              <div class="d-flex gap-1">
                <button
                    v-for="preset in PRESETS"
                    :key="preset"
                    class="width-btn"
                    :class="{ 'width-btn--active': snapCols(campoSelecionado.pivot.cols ?? 12) === preset }"
                    @click="campoSelecionado.pivot.cols = preset"
                >
                  {{ colsLabel(preset) }}
                </button>
              </div>
            </div>

            <div v-if="!['range', 'switch'].includes(campoSelecionado.tipo)" style="min-width:180px; flex:1; max-width:320px">
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
            </div>

            <div v-if="campoSelecionado.tipo === 'select'" class="d-flex align-center" style="padding-top:18px">
              <v-checkbox
                  v-model="campoSelecionado.pivot.select_multiplo"
                  :true-value="1"
                  :false-value="0"
                  label="Seleção múltipla"
                  hide-details
                  density="compact"
                  color="teal"
              />
            </div>

            <div class="ml-auto d-flex flex-column align-end flex-shrink-0">
              <div class="text-caption text-medium-emphasis mb-1">Preview</div>
              <v-chip size="small" variant="outlined" color="teal" prepend-icon="mdi-eye-outline">
                {{ campoSelecionado.label }}{{ campoSelecionado.pivot.obrigatorio ? ' *' : '' }}
              </v-chip>
            </div>
          </div>

          <template v-if="campoSelecionado.tipo === 'range'">
            <v-divider class="my-3" />
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon size="15" color="teal">mdi-tune-variant</v-icon>
              <span class="text-caption font-weight-medium edit-label-upper">Limites do intervalo</span>
            </div>
            <v-row dense>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model.number="campoSelecionado.pivot.range_minimo" label="Mínimo" density="compact" hide-details type="number" />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model.number="campoSelecionado.pivot.range_maximo" label="Máximo" density="compact" hide-details type="number" />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model.number="campoSelecionado.pivot.range_step" label="Step" density="compact" hide-details type="number" />
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
            <v-divider class="my-3" />
            <div class="d-flex align-center gap-2 mb-3">
              <v-icon size="15" color="teal">mdi-toggle-switch-outline</v-icon>
              <span class="text-caption font-weight-medium edit-label-upper">Rótulos e valores</span>
            </div>
            <v-row dense>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model="campoSelecionado.pivot.switch_true_label" label="Label ativo" placeholder="Sim" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model="campoSelecionado.pivot.switch_false_label" label="Label inativo" placeholder="Não" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model="campoSelecionado.pivot.switch_true_value" label="Valor ativo" placeholder="true" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <TextFieldComponent v-model="campoSelecionado.pivot.switch_false_value" label="Valor inativo" placeholder="false" density="compact" hide-details />
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
      </div>

      <CardTextComponent class="pa-0" style="max-height:380px; overflow-y:auto">
        <ProgressLinearComponent v-if="carregandoPivot" data-testid="configuracao-carregando" indeterminate color="teal" />

        <p v-else-if="camposPivot.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo associado a este formulário.
        </p>

        <p v-else-if="camposFiltrados.length === 0" class="text-body-2 text-medium-emphasis text-center py-8">
          Nenhum campo encontrado para "<strong>{{ busca }}</strong>".
        </p>

        <Draggable
            v-else
            v-model="camposPivot"
            :item-key="c => c.pivot.id"
            filter="button"
            :prevent-on-filter="false"
            :animation="200"
            :disabled="!!busca"
            ghost-class="drag-ghost"
            tag="div"
            class="campos-grid"
            @end="renumerarOrdem"
        >
          <template #item="{ element: campo }">
            <div
                v-show="campoCorresponde(campo)"
                data-testid="configuracao-campo-item"
                class="campo-item"
                :class="{ 'campo-selecionado': campoSelecionado?.pivot.id === campo.pivot.id }"
                :style="itemStyle(campo)"
                @mouseenter="hoveringId = campo.pivot.id"
                @mouseleave="hoveringId = null"
            >
              <div
                  class="drag-handle drag-bar"
                  :class="{ 'drag-bar--hover': hoveringId === campo.pivot.id && !busca, 'drag-bar--disabled': !!busca }"
                  @click.stop
              ></div>
              <div class="card-body">
                <div class="card-top">
                  <span class="type-badge" :style="typeBadgeStyle(campo.tipo)">{{ campo.tipo }}</span>
                  <div class="d-flex align-center ga-1">
                    <button
                        class="toggle-sm"
                        :class="campo.pivot.obrigatorio ? 'toggle-sm--on' : 'toggle-sm--off'"
                        :title="campo.pivot.obrigatorio ? 'Tornar opcional' : 'Tornar obrigatório'"
                        :aria-label="campo.pivot.obrigatorio ? 'Tornar opcional' : 'Tornar obrigatório'"
                        @click.stop="campo.pivot.obrigatorio = campo.pivot.obrigatorio ? 0 : 1"
                    >
                      <span class="toggle-sm__dot"></span>
                      <span class="toggle-sm__label">
                        <span v-if="campo.pivot.obrigatorio" class="toggle-sm__asterisk">*</span>
                        {{ campo.pivot.obrigatorio ? 'Obrig.' : 'Opc.' }}
                      </span>
                    </button>
                    <div
                        class="card-actions"
                        :class="{ 'card-actions--visible': hoveringId === campo.pivot.id || campoSelecionado?.pivot.id === campo.pivot.id }"
                        @click.stop
                    >
                      <button
                          data-testid="configuracao-campo-editar"
                          class="edit-btn"
                          :class="{ 'edit-btn--active': campoSelecionado?.pivot.id === campo.pivot.id }"
                          :aria-label="'Editar ' + campo.label"
                          @click="selecionarCampo(campo)"
                      >
                        <v-icon size="14">mdi-pencil</v-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="card-name">{{ campo.label }}</div>
                <div class="card-key">{{ campo.campo }}</div>
                <div
                    class="required-indicator"
                    :class="{ 'required-indicator--visible': campo.pivot.obrigatorio || hoveringId === campo.pivot.id }"
                >
                  <span class="req-dot" :class="campo.pivot.obrigatorio ? 'req-dot--on' : 'req-dot--off'"></span>
                  {{ campo.pivot.obrigatorio ? 'Obrigatório' : 'Opcional' }}
                </div>
              </div>
            </div>
          </template>
        </Draggable>
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
const hoveringId       = ref(null)

const PRESETS = [3, 6, 9, 12]

const TYPE_COLORS = {
  text:         { bg: '#E1F5EE', color: '#0F6E56' },
  number:       { bg: '#E1F5EE', color: '#0F6E56' },
  email:        { bg: '#E6F1FB', color: '#185FA5' },
  autocomplete: { bg: '#E6F1FB', color: '#185FA5' },
  date:         { bg: '#FAEEDA', color: '#854F0B' },
  datetime:     { bg: '#FAEEDA', color: '#854F0B' },
  radio:        { bg: '#EEEDFE', color: '#534AB7' },
  checkbox:     { bg: '#EEEDFE', color: '#534AB7' },
  select:       { bg: '#FAECE7', color: '#993C1D' },
  switch:       { bg: '#EAF3DE', color: '#3B6D11' },
  range:        { bg: '#EAF3DE', color: '#3B6D11' },
  time:         { bg: '#FBEAF0', color: '#993556' },
  textarea:     { bg: '#F0EEF5', color: '#5B4B8A' },
}

const snapCols = (cols) =>
  PRESETS.reduce((prev, curr) => Math.abs(curr - cols) < Math.abs(prev - cols) ? curr : prev)

const colsLabel = (preset) => ({ 3: '25%', 6: '50%', 9: '75%', 12: '100%' })[preset] ?? `${preset}`

const typeBadgeStyle = (tipo) => {
  const c = TYPE_COLORS[tipo] || { bg: '#E1F5EE', color: '#0F6E56' }
  return { background: c.bg, color: c.color }
}

const itemStyle = (campo) => {
  const cols = campo.pivot?.cols ?? 12
  return { gridColumn: `span ${snapCols(cols) / 3}` }
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
.lh-sm { line-height: 1.2; }
.edit-label-upper { text-transform: uppercase; letter-spacing: .06em; opacity: .6; }

/* Legend */
.legend-dot {
  display: block;
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-dot--obrigatorio { background: rgb(var(--v-theme-teal)); }
.legend-dot--opcional    { background: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 4)); }

/* Edit panel */
.edit-panel {
  padding: 14px 20px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  animation: slideIn 0.15s ease;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Width buttons */
.width-btn {
  border: 0.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.55);
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.width-btn:hover {
  border-color: rgb(var(--v-theme-teal));
  color: rgb(var(--v-theme-teal));
}
.width-btn--active {
  background: rgba(var(--v-theme-teal), 0.1);
  border-color: rgb(var(--v-theme-teal));
  color: rgb(var(--v-theme-teal));
  font-weight: 500;
}

/* Grid */
.campos-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 20px;
}

/* Card item */
.campo-item {
  position: relative;
  border: 0.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  cursor: grab;
  background: rgb(var(--v-theme-surface));
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 80px;
  overflow: hidden;
  user-select: none;
}
.campo-item:active { cursor: grabbing; }
.campo-item:hover {
  border-color: rgb(var(--v-theme-teal));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-teal), 0.14);
}
.campo-item.campo-selecionado {
  border-color: rgb(var(--v-theme-teal));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-teal), 0.2);
  background: rgba(var(--v-theme-teal), 0.04);
}

/* Drag bar — indicador visual apenas */
.drag-bar {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background 0.15s;
  z-index: 1;
  pointer-events: none;
}
.drag-bar--hover   { background: rgb(var(--v-theme-teal)); }

/* Card body */
.card-body {
  padding: 10px 10px 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* Card top row */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
}

/* Type badge */
.type-badge {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  line-height: 1.6;
}

/* Hover actions */
.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.card-actions--visible { opacity: 1; }

/* Mini toggle */
.toggle-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  border-radius: 20px;
  border: 1.5px solid transparent;
  padding: 0 6px 0 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}
.toggle-sm__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.toggle-sm__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 2px;
}
.toggle-sm__asterisk {
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  margin-top: -2px;
}
/* Estado ON — obrigatório */
.toggle-sm--on {
  background: rgb(var(--v-theme-success));
  border-color: rgb(var(--v-theme-success));
}
.toggle-sm--on .toggle-sm__dot  { background: rgba(255,255,255,0.9); }
.toggle-sm--on .toggle-sm__label { color: white; }
/* Estado OFF — opcional */
.toggle-sm--off {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-color: rgba(var(--v-theme-on-surface), 0.20);
}
.toggle-sm--off .toggle-sm__dot  { background: rgba(var(--v-theme-on-surface), 0.38); }
.toggle-sm--off .toggle-sm__label { color: rgba(var(--v-theme-on-surface), 0.55); }

/* Edit button */
.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.38);
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background 0.12s, color 0.12s;
}
.edit-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.87);
}
.edit-btn--active { color: rgb(var(--v-theme-teal)) !important; }

/* Card text */
.card-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.campo-selecionado .card-name { color: rgb(var(--v-theme-teal)); }

.card-key {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.42);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
}

/* Required indicator */
.required-indicator {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  margin-top: 1px;
}
.required-indicator--visible { opacity: 1; }
.req-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.req-dot--on  { background: rgb(var(--v-theme-teal)); }
.req-dot--off { background: rgba(var(--v-border-color), calc(var(--v-border-opacity) * 4)); }

:global(.drag-ghost) {
  opacity: 0.45;
  background: rgba(var(--v-theme-teal), 0.06) !important;
}
</style>
