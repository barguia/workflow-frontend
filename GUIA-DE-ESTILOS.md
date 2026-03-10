# Guia de Estilos — Workflow Frontend

> Este documento é a **referência obrigatória** para qualquer dev que precise escrever CSS, definir cores ou aplicar estilos no projeto.
> O objetivo é garantir que todos os temas funcionem corretamente sem intervenção manual.

---

## Sumário

1. [Como o sistema de temas funciona](#1-como-o-sistema-de-temas-funciona)
2. [Tokens de cor disponíveis](#2-tokens-de-cor-disponíveis)
3. [Como usar cores corretamente](#3-como-usar-cores-corretamente)
4. [O que nunca fazer](#4-o-que-nunca-fazer)
5. [Defaults globais de componentes Vuetify](#5-defaults-globais-de-componentes-vuetify)
6. [Temas disponíveis](#6-temas-disponíveis)
7. [Como adicionar um novo tema](#7-como-adicionar-um-novo-tema)
8. [Classes CSS globais disponíveis](#8-classes-css-globais-disponíveis)
9. [Checklist antes de abrir PR](#9-checklist-antes-de-abrir-pr)

---

## 1. Como o sistema de temas funciona

O projeto usa **Vuetify 3** com múltiplos temas configurados. A troca de tema é gerenciada pelo `themeStore` (Pinia) e persiste no `localStorage` do navegador.

```
Usuário seleciona tema
       ↓
ThemeSwitcherComponent → themeStore.applyTheme(key, vuetifyTheme)
       ↓
vuetifyTheme.global.name.value = key  (Vuetify troca as CSS variables)
       ↓
localStorage.setItem('theme', key)    (persiste entre sessões)
```

**Arquivos envolvidos:**

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/main.js` | Define as paletas de cores de cada tema |
| `src/stores/themeStore.js` | Estado reativo + lista de temas para o seletor |
| `src/components/menu/componentes/ThemeSwitcherComponent.vue` | UI de seleção de tema |
| `src/assets/css/global.css` | Classes CSS globais que usam os tokens |

---

## 2. Tokens de cor disponíveis

O Vuetify expõe cada cor do tema ativo como uma **variável CSS** no formato:

```
--v-theme-<nome-do-token>
```

O valor armazenado é uma **tripla RGB sem vírgulas** (ex: `74 108 247`).
Por isso, para usar a cor você **precisa** envolvê-la em `rgb()` ou `rgba()`.

### Tokens do projeto

| Token | Uso semântico |
|-------|--------------|
| `primary` | Cor de destaque principal — botões, links, ícones ativos |
| `secondary` | Cor de apoio — badges, chips, elementos secundários |
| `accent` | Destaque pontual — hover especial, detalhe visual |
| `background` | Fundo da página (`<body>`, `v-main`) |
| `surface` | Fundo de cards, dialogs, drawers, inputs |
| `on-surface` | Cor de texto/ícone sobre `surface` (gerado automaticamente pelo Vuetify) |
| `error` | Erros, exclusões, alertas críticos |
| `warning` | Alertas de atenção |
| `info` | Informações neutras |
| `success` | Confirmações, operações bem-sucedidas |
| `textPrimary` | Texto principal (títulos, labels) |
| `textSecondary` | Texto secundário (subtítulos, dicas, placeholders) |

---

## 3. Como usar cores corretamente

### Em CSS/`<style scoped>`

```css
/* ✅ CORRETO — cor sólida */
background: rgb(var(--v-theme-primary));
color:      rgb(var(--v-theme-textPrimary));

/* ✅ CORRETO — com transparência */
background: rgba(var(--v-theme-primary), 0.12);
border:     1px solid rgba(var(--v-theme-on-surface), 0.08);
box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.15);
```

### Em props de componentes Vuetify

```vue
<!-- ✅ CORRETO — usa o token nomeado -->
<v-btn color="primary">Salvar</v-btn>
<v-icon color="error">mdi-delete</v-icon>
<v-chip color="secondary">Tag</v-chip>
```

### Em `style` inline (quando inevitável)

```vue
<!-- ✅ CORRETO -->
<div :style="{ background: 'rgb(var(--v-theme-surface))' }">

<!-- ❌ ERRADO -->
<div style="background: #ffffff">
```

---

## 4. O que nunca fazer

Qualquer cor hardcoded **quebra o tema** — o elemento ficará com cor errada quando o usuário trocar o tema.

```css
/* ❌ PROIBIDO — cores fixas */
background: #ffffff;
background: white;
color: #333333;
border-color: rgba(0, 0, 0, 0.08);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

```vue
<!-- ❌ PROIBIDO em props Vuetify -->
<v-tabs color="deep-purple-accent-4">
<v-btn color="blue darken-1">
```

```css
/* ❌ PROIBIDO — sintaxe incompleta (falta rgb()) */
/* Vuetify armazena como tripla "R G B", não como hex */
color: var(--v-theme-primary);         /* resultado: "74 108 247" — inválido como cor */

/* ✅ CORRETO */
color: rgb(var(--v-theme-primary));
```

### Exceções permitidas

Cores **fixas de marca** (ícones de redes sociais, logos) podem ser hardcoded pois não dependem de tema:

```js
// ✅ OK — cor de marca externa
{ color: '#1877F2' }  // Facebook
{ color: '#E1306C' }  // Instagram
```

Sombras e bordas neutras com `rgba(0,0,0,...)` **somente** em temas claros são tecnicamente funcionais, mas o ideal é usar `rgba(var(--v-theme-on-surface), ...)` para funcionar também em temas escuros.

---

## 5. Defaults globais de componentes Vuetify

Configurados em `src/main.js` via `defaults`. Estes valores são aplicados automaticamente em todos os componentes listados — **não repita-os em cada uso**.

| Componente | Defaults aplicados |
|------------|-------------------|
| `VTextField` | `variant="outlined"`, `density="comfortable"`, `color="primary"` |
| `VTextarea` | `variant="outlined"`, `density="comfortable"`, `color="primary"`, `rows=3` |
| `VSelect` | `variant="outlined"`, `density="comfortable"`, `color="primary"` |
| `VCombobox` | `variant="outlined"`, `density="comfortable"`, `color="primary"` |
| `VRadioGroup` | `color="primary"`, `density="comfortable"` |
| `VCheckbox` | `color="primary"`, `density="comfortable"` |
| `VDataTable` | `density="comfortable"`, `hover=true` |
| `VBtn` | `text-transform: none`, `letter-spacing: 0` |

Para **sobrescrever** um default em um caso específico, passe a prop explicitamente:

```vue
<!-- Sobrescreve o default outlined para filled em um caso especial -->
<v-text-field variant="filled" />
```

---

## 6. Temas disponíveis

| Key | Label | Tipo | Primary |
|-----|-------|------|---------|
| `light` | Claro | Claro | `#4A6CF7` |
| `dark` | Escuro | Escuro | `#58A6FF` |
| `violeta` | Violeta | Claro | `#7C3AED` |
| `aurora` | Aurora | Escuro | `#00D4AA` |
| `ambar` | Âmbar | Claro | `#D97706` |
| `oceano` | Oceano | Claro | `#0EA5E9` |

Todos os temas definem os mesmos tokens listados na [seção 2](#2-tokens-de-cor-disponíveis). Se você usa apenas os tokens, o componente funcionará em todos os temas automaticamente.

---

## 7. Como adicionar um novo tema

São necessárias alterações em **dois arquivos apenas**:

### Passo 1 — Paleta de cores (`src/main.js`)

Adicione um novo objeto dentro de `themes`:

```js
// src/main.js
meutema: {
    dark: false,          // true se for tema escuro
    colors: {
        background:    '#...',
        surface:       '#...',
        primary:       '#...',
        secondary:     '#...',
        accent:        '#...',
        error:         '#...',
        warning:       '#...',
        info:          '#...',
        success:       '#...',
        textPrimary:   '#...',
        textSecondary: '#...',
    },
},
```

> **Todos os tokens são obrigatórios.** Tokens faltando ficam como `undefined` e quebram o layout.

### Passo 2 — Registro no seletor (`src/stores/themeStore.js`)

Adicione uma entrada no array `THEMES`:

```js
{
    key:     'meutema',           // deve ser igual à chave em main.js
    label:   'Meu Tema',          // nome exibido no seletor
    icon:    'mdi-nome-do-icone', // ícone MDI para o botão do seletor
    preview: '#??????',           // cor hex da bolinha de preview (normalmente = primary)
},
```

Pronto. O `ThemeSwitcherComponent` detecta o novo tema automaticamente.

---

## 8. Classes CSS globais disponíveis

Definidas em `src/assets/css/global.css`. Use-as em vez de reinventar estilos equivalentes.

| Classe | Efeito |
|--------|--------|
| `.title` | Texto de título com `color: textPrimary`, `font-weight: 600` |
| `.subtitle` | Subtítulo com `color: secondary` |
| `.nav-link` | Link de navegação sem sublinhado, `color: textPrimary` |
| `.main-content` | Fundo e cor de texto da área principal, com transição suave |
| `.content-container` | Container centralizado com padding padrão |
| `.content-box` | Card com sombra leve e `background: surface` |
| `.text-paragraph` | Parágrafo com `font-size: 0.8rem` e alinhamento justificado |
| `.hero-overlay` | Overlay escuro para seções com imagem de fundo |

---

## 9. Checklist antes de abrir PR

Antes de submeter qualquer PR que envolva estilos, verifique:

- [ ] Não há nenhuma cor hexadecimal hardcoded no CSS (exceto cores de marca externa)
- [ ] Não há `rgba(0, 0, 0, ...)` para bordas/sombras — use `rgba(var(--v-theme-on-surface), ...)`
- [ ] Variáveis CSS usam `rgb(var(...))` e não `var(...)` diretamente
- [ ] Props de cor em componentes Vuetify usam tokens (`"primary"`, `"error"`) e não valores fixos (`"blue darken-1"`)
- [ ] Testou visualmente com pelo menos **dois temas** (um claro e um escuro)
- [ ] Se adicionou um tema novo: ambos os arquivos (`main.js` e `themeStore.js`) foram atualizados e todos os tokens foram preenchidos
