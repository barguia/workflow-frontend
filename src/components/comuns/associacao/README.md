# UmParaMuitosComponent2

> **Versão documentada:** `1.0.0`
> Verifique o campo `@version` no topo de `UmParaMuitosComponent2.vue`. Se ele divergir da versão acima, este README está desatualizado.

Dialog genérico de associação **um-para-muitos** via checkboxes agrupados. Permite selecionar múltiplos itens vinculados a uma entidade principal e persiste a seleção em uma API REST.

---

## Uso básico

```vue
<UmParaMuitosComponent2
  v-model="dialog"
  titulo="Perfis do usuário"
  :entidade-id="usuario.id"
  endpoint-api="app/roles-user"
  campo-ids-associados="roles_ids"
  :selecionados="idsJaAssociados"
  :todos-itens="gruposDisponiveis"
  @salvo="aoSalvar"
/>
```

---

## Props

| Prop | Tipo | Padrão | Obrigatório | Descrição |
|------|------|--------|:-----------:|-----------|
| `modelValue` | `Boolean` | `false` | — | Controla a visibilidade do dialog (`v-model`) |
| `titulo` | `String` | — | ✓ | Texto exibido no cabeçalho do dialog |
| `entidadeId` | `Number \| String` | — | ✓ | ID da entidade principal enviado no payload |
| `endpointApi` | `String` | — | ✓ | Endpoint da API para salvar (relativo ao `baseURL` do Axios) |
| `campoIdsAssociados` | `String` | `'ids_associados'` | — | Chave do campo no payload que receberá o array de IDs selecionados |
| `selecionados` | `Array` | `[]` | — | Array de IDs já associados (pré-marca os checkboxes ao abrir) |
| `todosItens` | `Array` | — | ✓ | Lista de grupos com as opções disponíveis para seleção |
| `metodoAtualizacao` | `String` | `'POST'` | — | Método HTTP da requisição: `'POST'` ou `'PUT'` |
| `larguraMaxima` | `String` | `'1200px'` | — | Largura máxima do dialog (`max-width`) |

---

## Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `update:modelValue` | `Boolean` | Emitido para fechar o dialog via `v-model` |
| `salvo` | — | Emitido após o save ser concluído com sucesso na API |

---

## Formato de `todosItens`

Cada elemento do array representa um **grupo** de opções:

```js
[
  {
    grupo: 'api',               // Título do grupo (exibido como cabeçalho da coluna)
    options: [
      { value: 1, text: 'admin' },
      { value: 2, text: 'editor' },
    ],
  },
  {
    grupo: 'web',
    options: [
      { value: 3, text: 'viewer' },
    ],
  },
]
```

---

## Payload enviado à API

```json
{
  "id": "<entidadeId>",
  "<campoIdsAssociados>": [1, 3, 7]
}
```

Exemplo com os valores padrão: `{ "id": 42, "ids_associados": [1, 3, 7] }`

---

## Exemplo completo — Usuário × Perfis

```vue
<template>
  <v-btn @click="abrirModal(usuario)">Gerenciar Perfis</v-btn>

  <UmParaMuitosComponent2
    v-if="dialog"
    v-model="dialog"
    :titulo="`Perfis de: ${usuarioSelecionado?.name}`"
    :entidade-id="usuarioSelecionado?.id"
    endpoint-api="app/roles-user"
    campo-ids-associados="roles_ids"
    :selecionados="rolesDoUsuario"
    :todos-itens="grupoDeRoles"
    @salvo="aoSalvar"
  />
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api.js'
import UmParaMuitosComponent2 from '@/components/comuns/associacao/UmParaMuitosComponent2.vue'

const dialog            = ref(false)
const usuarioSelecionado = ref(null)
const grupoDeRoles      = ref([])
const rolesDoUsuario    = ref([])

async function abrirModal(usuario) {
  const [resRoles, resDoUsuario] = await Promise.all([
    api.get('app/roles'),
    api.get(`app/roles-user/${usuario.id}`),
  ])

  // Monta os grupos
  grupoDeRoles.value = []
  resRoles.data.data.forEach((role) => {
    let grupo = grupoDeRoles.value.find(g => g.grupo === role.guard_name)
    if (!grupo) {
      grupo = { grupo: role.guard_name, options: [] }
      grupoDeRoles.value.push(grupo)
    }
    grupo.options.push({ value: role.id, text: role.name })
  })

  rolesDoUsuario.value   = resDoUsuario.data.data.map(r => r.id)
  usuarioSelecionado.value = usuario
  dialog.value           = true
}

function aoSalvar() {
  dialog.value = false
  setTimeout(() => { usuarioSelecionado.value = null }, 300)
}
</script>
```

---

## Como adicionar um novo caso de uso

1. Passe o `endpoint-api` correto para o seu contexto
2. Monte o array `todosItens` no formato `[{ grupo, options: [{ value, text }] }]`
3. Carregue os IDs já associados em `selecionados`
4. Ouça `@salvo` para fechar o dialog e limpar o estado local

---

## Versionamento

O componente usa um bloco `@component-api` no seu próprio arquivo `.vue` como fonte da verdade:

```
@version  1.0.0
```

### Regra de bump

| Mudança | Ação |
|---------|------|
| Adicionar/remover/renomear prop ou emit | Bump **minor** (ex: `1.0.0` → `1.1.0`) e atualizar README |
| Alterar comportamento público (payload, lógica de fechamento) | Bump **minor** e atualizar README |
| Quebrar compatibilidade (remover prop obrigatória, mudar formato) | Bump **major** (ex: `1.1.0` → `2.0.0`) e atualizar README |
| Correção interna sem impacto na API pública | Bump **patch** (ex: `1.0.0` → `1.0.1`), README opcional |

> Ao solicitar alterações neste componente ao Claude Code, inclua: _"atualize o `@version` e o README conforme necessário"_.
