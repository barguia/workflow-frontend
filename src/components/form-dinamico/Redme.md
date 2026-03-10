# `FormularioDinamico.vue` – Documentação Oficial

> **Um componente Vue 3 + Vuetify 3 100% dinâmico, reutilizável e configurável via `fields`**

---

## Visão Geral

O `FormularioDinamico` é um formulário **totalmente configurável** por meio de um array de objetos (`fields`). Ele suporta:

- Campos de texto, email, senha, data, textarea
- Selects (simples e múltiplos)
- Radio e Checkbox
- **Desabilitar campos**
- **Ocultar campos (`v-show`)**
- **Remover campos do DOM (`v-if`)**
- **Carregar opções dinamicamente do backend**
- **Dependências entre campos (ex: Estado → Cidade)**
- **Validação com Vuetify**
- **Eventos personalizados (`onChange`, `field-change`)**

---

## Uso Básico

```vue
<template>
  <FormularioDinamico
    :fields="fields"
    v-model="form"
    :validation-errors="errors"
    @field-change="onFieldChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import FormularioDinamico from '@/components/form-dinamico/FormularioDinamico.vue'

const form = ref({})
const errors = ref({})
const fields = ref([
  { key: 'nome', label: 'Nome', type: 'text' }
])
</script>
```

---

## Configuração dos `fields`

Cada campo é um objeto com as seguintes propriedades:

| Propriedade | Tipo | Obrigatório | Descrição |
|------------|------|-------------|----------|
| `key` | `string` | Yes | Chave única do campo (usada no `v-model`) |
| `label` | `string` | Yes | Rótulo exibido |
| `type` | `string` | Yes | `text`, `email`, `password`, `date`, `textarea`, `select`, `radio`, `checkbox` |
| `rules` | `array` | No | Regras de validação Vuetify |
| `optional` | `boolean` | No | Se `true`, campo não é obrigatório |
| `multiple` | `boolean` | No | Para `select` múltiplo |
| `inline` | `boolean` | No | Para `radio`/`checkbox` em linha |

---

## Funcionalidades Dinâmicas

### 1. `disabled` – Desabilitar campo

```js
{
  key: 'cidade_id',
  disabled: true // sempre desabilitado
}
```

```js
{
  key: 'cidade_id',
  disabled: (form) => !form.estado_id // desabilitado até selecionar estado
}
```

---

### 2. `visible` – Ocultar com `v-show`

```js
{
  key: 'observacoes',
  visible: false // nunca aparece
}
```

```js
{
  key: 'observacoes',
  visible: (form) => form.estado_id === 1 // só aparece se for SP
}
```

---

### 3. `renderIf` – Remover do DOM com `v-if`

```js
{
  key: 'campo_admin',
  renderIf: () => user.isAdmin // só existe no DOM se for admin
}
```

> **Diferença**: `visible` = esconde, mas mantém no DOM. `renderIf` = remove completamente.

---

### 4. `options` – Carregar opções do backend

```js
{
  key: 'estado_id',
  type: 'select',
  options: () => api.get('/estados')
}
```

```js
{
  key: 'cidade_id',
  type: 'select',
  options: async (form) => {
    if (!form.estado_id) return []
    return await api.get(`/cidades?estado_id=${form.estado_id}`)
  }
}
```

> **Formato esperado**: `{ text: 'Nome', value: 1 }`

---

### 5. `onChange` – Ação ao alterar campo

```js
{
  key: 'estado_id',
  onChange: async ({ setField }) => {
    setField('cidade_id', null) // limpa cidade
  }
}
```

```js
{
  key: 'email',
  onChange: async ({ value, form }) => {
    if (value.includes('@admin')) {
      form.is_admin = true
    }
  }
}
```

#### Parâmetros do `onChange`

| Parâmetro | Tipo | Descrição |
|---------|------|----------|
| `value` | any | Novo valor do campo |
| `form` | object | Formulário completo |
| `setField(key, value)` | function | Atualiza outro campo |
| `loadOptions()` | function | Recarrega opções dinâmicas |

---

## Eventos Emitidos

```vue
<FormularioDinamico @field-change="handleChange" />
```

```js
const handleChange = ({ field, value, form }) => {
  console.log(field.key, '→', value)
}
```

---

## Métodos Expostos (`ref`)

```js
const formulario = ref(null)

// Resetar validação
formulario.value.resetValidation()

// Recarregar opções manualmente
formulario.value.loadOptions()
```

---

## Exemplo Completo: Estado → Cidade + Condicionais

```js
const fields = [
  { key: 'nome', label: 'Nome', type: 'text', rules: [v => !!v || 'Obrigatório'] },
  {
    key: 'estado_id',
    label: 'Estado',
    type: 'select',
    options: () => api.get('/estados'),
    onChange: ({ setField }) => setField('cidade_id', null)
  },
  {
    key: 'cidade_id',
    label: 'Cidade',
    type: 'select',
    disabled: f => !f.estado_id,
    options: async f => f.estado_id ? await api.get(`/cidades?estado_id=${f.estado_id}`) : [],
    rules: [v => !!v || 'Obrigatório']
  },
  {
    key: 'obs',
    label: 'Obs (só em SP)',
    type: 'textarea',
    visible: f => f.estado_id === 1
  },
  {
    key: 'admin',
    label: 'Campo Admin',
    type: 'text',
    renderIf: () => isAdmin.value
  }
]
```

---

## Formato de Opções do `v-select`

```js
// CORRETO
{ text: 'São Paulo', value: 1 }

// ERRADO
{ label: 'SP', id: 1 }
```

---

## Dependências

Certifique-se de ter:

```bash
npm install vuetify
```

E os wrappers:

```
src/components/comuns/forms/
├── FormComponent.vue
├── TextFieldComponent.vue
├── SelectComponent.vue
├── TextAreaComponent.vue
├── RadioComponent.vue
├── CheckboxComponent.vue
```

---

## Dicas de Performance

- Use `renderIf` para campos pesados
- Evite `JSON.stringify` em produção (substitua por `lodash.isEqual`)
- Cacheie chamadas à API se necessário

---
## Autores

- **Eduardo Barbelino da Purificação** – Criador original
