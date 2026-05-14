# Formulário Dinâmico — Modo de Trabalho

Ativa o modo de trabalho para evoluir ou corrigir o módulo de **Formulário Dinâmico**.
Leia este documento inteiro antes de iniciar qualquer implementação.

---

## Regra fundamental: componentes da aplicação primeiro

**Nunca usar componentes Vuetify diretamente** (`v-text-field`, `v-select`, `v-dialog`, etc.) sem antes verificar se existe um wrapper em `src/components/comuns/`.

### Protocolo ao iniciar uma tarefa

Antes de escrever qualquer código, declare:

| Símbolo | Significado |
|---------|-------------|
| ✅ | Componente já existe — use-o |
| ❓ | Componente não existe — **pergunte ao usuário**: criar wrapper ou usar Vuetify diretamente? |
| ⚠️ | Vuetify direto aprovado pelo usuário (documente o motivo) |

**Aguarde a resposta do usuário para os itens ❓ antes de implementar.**

---

## Componentes já componentizados

### Formulários — `src/components/comuns/forms/`

| Componente | Vuetify equivalente | Props relevantes |
|---|---|---|
| `TextFieldComponent` | `v-text-field` | `label`, `type`, `mask`, `rules`, `required`, `disabled` |
| `TextAreaComponent` | `v-textarea` | passa `v-bind="$attrs"` — aceita todas as props do Vuetify |
| `SelectComponent` | `v-select` | `label`, `items[{value,text}]`, `multiple`, `clearable`, `sorted` |
| `AutocompleteComponent` | `v-autocomplete` | `label`, `items[{value,text}]`, `multiple`, `noFilter`, `clearable` |
| `ComboboxComponent` | `v-combobox` | `label`, `items[{value,text}]`, `multiple`, `chips`, `clearable` |
| `RadioComponent` | `v-radio-group` | `label`, `items[{value,text}]`, `inline`, `sorted` |
| `CheckboxComponent` | grupo de `v-checkbox` | `label`, `items[{value,text}]`, `multiple`, `inline`, `chips` |
| `CheckboxItemComponent` | `v-checkbox` único | — |
| `EmailComponent` | `v-text-field type=email` | `label`, `rules`, `required` |
| `DatetimeComponent` | datetime input | `label`, `rules`, `required` |
| `TimeComponent` | time input | `label`, `rules`, `required` |
| `RangeComponent` | `v-slider` | `label`, `min`, `max`, `step`, `thumbLabel`, `showTicks` |
| `SwitchComponent` | `v-switch` | `label`, `trueLabel`, `falseLabel`, `trueValue`, `falseValue` |
| `FormComponent` | `v-form` | — |

> **Formato obrigatório de `items`** para Select/Radio/Checkbox/Autocomplete/Combobox:
> `[{ value: string|number, text: string }]`

### Cards — `src/components/comuns/cards/`

| Componente | Vuetify |
|---|---|
| `CardComponent` | `v-card` |
| `CardTitleComponent` | `v-card-title` |
| `CardTextComponent` | `v-card-text` |
| `CardActionsComponent` | `v-card-actions` |

### Layout — `src/components/comuns/layout/`

| Componente | Vuetify |
|---|---|
| `RowComponent` | `v-row` |
| `ColComponent` | `v-col` |
| `DividerComponent` | `v-divider` |
| `SpacerComponent` | `v-spacer` |

### Outros — `src/components/comuns/`

| Componente | Vuetify | Localização |
|---|---|---|
| `ButtonComponent` | `v-btn` | `buttons/` |
| `DialogComponent` | `v-dialog` | `dialogs/` |
| `IconComponent` | `v-icon` | `icons/` |
| `ChipComponent` | `v-chip` | `chips/` |
| `ProgressLinearComponent` | `v-progress-linear` | `progress/` |
| `ProgressCircularComponent` | `v-progress-circular` | `progress/` |
| `AlerComponent` | `v-alert` | `alerts/` |
| `SnackbarComponent` | `v-snackbar` | `alerts/` |
| `ListComponent` / `ListItemComponent` | `v-list` / `v-list-item` | `lists/` |
| `ContainerComponent` | `v-container` | `containers/` |
| `AvatarComponent` | `v-avatar` | `containers/` |

---

## Candidatos a componentizar (alta reutilização, ainda sem wrapper)

Estes componentes Vuetify aparecem com frequência no módulo e são bons candidatos para um wrapper próprio:

| Vuetify | Onde aparece | Prioridade |
|---|---|---|
| `v-expansion-panels` + `v-expansion-panel` | `ConfiguracaoFormulario.vue` | Alta |
| `v-chip` (como badge de tipo) | `ConfiguracaoFormulario.vue`, outros | Média |
| `v-text-field` direto (campo de busca/toolbar) | `ConfiguracaoFormulario.vue` | Baixa |

---

## Arquitetura do FormularioDinamico

### Arquivos principais

```
src/components/pages/formulario-dinamico/
├── GestaoFormularioPage.vue          — CRUD de formulários (listagem)
├── routes/routes.js
└── sub-pages/
    ├── FormularioPage.vue            — Lista + orquestra os 3 dialogs
    ├── AssociacaoCampos.vue          — Dialog: associar campos ao formulário
    ├── ConfiguracaoFormulario.vue    — Dialog: configurar pivot dos campos
    ├── PreviewFormularioDialog.vue   — Dialog: preview do formulário
    ├── CampoPage.vue                 — CRUD de campos
    ├── RegrasCampoPage.vue           — Regras por campo
    └── VisaoGeralPage.vue

src/components/form-dinamico/
├── FormularioDinamico.vue            — Renderizador genérico de formulários
└── FormExemploPage.vue
```

### Tipos de campo suportados pelo FormularioDinamico

`text` · `textarea` · `email` · `date` · `datetime` · `time` · `number` · `password` · `radio` · `checkbox` · `select` · `autocomplete` · `combobox` · `range` · `switch`

### Endpoints de API

| Recurso | Método | Endpoint |
|---|---|---|
| Formulários | CRUD | `wf/forms/formularios` |
| Campos | CRUD | `wf/forms/campos` |
| Campos do formulário (pivot) | GET | `wf/forms/formularios-campos/{id}` |
| Associar campos | POST | `wf/forms/formularios-campos` |
| Atualizar pivot | PUT | `wf/forms/formularios-campos/{pivotId}` |

### Estrutura do pivot (`campos_opcoes` e `pivot`)

```js
// Campo retornado pela API
{
  id, campo, label, tipo, mascara, placeholder, grupo,
  opcoes_por_uri,       // 0 = estático, 1 = busca na URI
  opcoes_uri,           // endpoint para buscar opções (quando opcoes_por_uri=1)
  opcoes_uri_value,     // chave do item a usar como value
  opcoes_uri_text,      // chave do item a usar como texto
  campos_opcoes: [{ id, opcao, valor, ordem }],  // opções estáticas
  pivot: {
    id, cols, ordem, valor_default, obrigatorio, select_multiplo,
    range_minimo, range_maximo, range_step,
    switch_true_label, switch_false_label,
    switch_true_value, switch_false_value,
  }
}
```

### Regras de serialização do `valor_default`

| Tipo de campo | Formato salvo no banco | Como ler em JS |
|---|---|---|
| `text`, `email`, `date`, etc. | string simples | usar direto |
| `radio`, `select` (simples) | string simples | usar direto |
| `select` múltiplo, `checkbox` | JSON array `'["a","b"]'` | `JSON.parse()` com fallback para split por vírgula |
| `range` | número como string `"500"` | `Number(valor)` |
| `switch` | string com o `true_value` ou `false_value` | usar direto |
| Campos com `opcoes_por_uri=1` (ID numérico) | string numérica `"4"` | `Number(valor)` para garantir match com items |

### Carregamento de opções

```js
// Padrão para carregar opções de campos selecionais
// Referência: ConfiguracaoFormulario.vue > carregarOpcoesCampos()
//             PreviewFormularioDialog.vue > fields computed

// opcoes_por_uri === 0 → mapear campos_opcoes
items = campo.campos_opcoes
  .sort((a, b) => Number(a.ordem) - Number(b.ordem) || ...)
  .map(o => ({ value: o.valor, text: o.opcao }))

// opcoes_por_uri === 1 → buscar na API
const res = await api.get(campo.opcoes_uri, { params: { [campo.opcoes_uri_text]: search } })
items = res.data.data.map(item => ({ value: item[campo.opcoes_uri_value], text: item[campo.opcoes_uri_text] }))
```

---

## Padrões de código do projeto

- Commit em PT-BR, particípio passado: `Adicionado`, `Corrigido`, `Refatorado`
- Cores via variáveis CSS Vuetify: `rgb(var(--v-theme-primary))`, nunca hardcoded
- Ícones MDI: `mdi-nome-do-icone`
- Notificações via `window.dispatchEvent(new CustomEvent('notification', { detail: { type, message } }))`
- Variante padrão global: `outlined` · Density padrão: `comfortable`
