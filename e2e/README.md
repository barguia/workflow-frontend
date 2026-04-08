# Testes E2E — Convenções e Cobertura

## Padrão de nomenclatura do `data-testid`

### Formato

```
{pagina}-{elemento}-{descricao}
```

| Segmento      | Descrição                                              | Exemplos                              |
|---------------|--------------------------------------------------------|---------------------------------------|
| `pagina`      | Contexto da página ou seção onde o elemento está       | `login`, `volumetria`, `ficha-tecnica`|
| `elemento`    | Tipo do elemento                                       | `btn`, `input`, `select`, `tabela`, `link` |
| `descricao`   | Identificação única do que o elemento faz ou representa| `entrar`, `email`, `filtro-status`    |

### Tipos de elemento

| Componente                     | Sufixo     |
|--------------------------------|------------|
| Botão (`v-btn`, `ButtonComponent`) | `btn`  |
| Campo de texto (`TextFieldComponent`) | `input` |
| Select / Combobox              | `select`   |
| Tabela (`v-data-table`, `CrudDataTableComponent`) | `tabela` |
| Link (`<a>`)                   | `link`     |
| Toggle de botões (`v-btn-toggle`) | `toggle` |
| Checkbox / Switch              | `checkbox` |

### Exemplos práticos

```html
<!-- Login -->
<TextFieldComponent data-testid="login-input-email" />
<TextFieldComponent data-testid="login-input-senha" />
<ButtonComponent   data-testid="login-btn-entrar" />
<ButtonComponent   data-testid="login-link-esqueci-senha" />

<!-- Volumetria -->
<v-btn-toggle data-testid="volumetria-toggle-status" />
<v-btn        data-testid="volumetria-btn-filtro-aberto" />
<v-btn        data-testid="volumetria-btn-filtro-finalizado" />
<v-btn        data-testid="volumetria-btn-fechar-painel" />
<v-data-table data-testid="volumetria-tabela-processos" />

<!-- Ficha Técnica -->
<ButtonComponent data-testid="ficha-tecnica-btn-voltar" />
<v-data-table    data-testid="ficha-tecnica-tabela-tarefas" />

<!-- Fila de Tarefas -->
<ButtonComponent data-testid="fila-tarefa-btn-voltar" />
<v-data-table    data-testid="fila-tarefa-tabela-itens" />
<a               data-testid="fila-tarefa-link-tarefa" />
```

### Elementos em listas repetidas

Para elementos dentro de loops, inclua o identificador do item:

```html
<!-- ✗ Evitar: mesmo testid em múltiplos elementos -->
<v-card v-for="card in cards" data-testid="volumetria-card" />

<!-- ✓ Correto: testid único por item -->
<v-card v-for="(card, i) in cards" :data-testid="`volumetria-card-${card.id ?? i}`" />
```

E no teste:

```js
// Busca pelo id do item
page.getByTestId('volumetria-card-42')

// Ou por padrão de prefixo
page.locator('[data-testid^="volumetria-card-"]').nth(1)
```

---

## Como usar nos testes

### Botões e elementos nativos

```js
await page.getByTestId('login-btn-entrar').click()
await expect(page.getByTestId('volumetria-tabela-processos')).toBeVisible()
```

### Campos de texto (`TextFieldComponent`, `v-text-field`)

O `data-testid` é aplicado no componente wrapper (`<div>`), não no `<input>` interno.
Para interagir com o campo, encadeie `.locator('input')`:

```js
// ✗ Falha — tenta fazer fill no div wrapper
await page.getByTestId('login-input-email').fill('valor')

// ✓ Correto — navega até o input interno
await page.getByTestId('login-input-email').locator('input').fill('valor')
```

### Selects (`SelectComponent`, `v-select`)

O mesmo se aplica a selects — use `.locator('input')` para abrir o dropdown:

```js
await page.getByTestId('pesquisa-select-projetos').locator('input').click()
await page.getByRole('option', { name: 'Nome do Projeto' }).click()
```

### Verificar visibilidade

Para verificar se um campo ou tabela está visível, o wrapper é suficiente:

```js
await expect(page.getByTestId('login-input-email')).toBeVisible()
await expect(page.getByTestId('fila-tarefa-tabela')).toBeVisible()
```

---

## Verificando a cobertura

Execute o script de análise para ver quais páginas e elementos ainda não possuem `data-testid`:

```bash
npm run analyze:testids
```

### O que o relatório mostra

- **Agrupamento por seção** (`aplicacao`, `controle-acesso`, `projeto`)
- **Por arquivo:** quantos elementos têm/não têm `data-testid`, com tag e número de linha
- **Resumo global:** total de elementos, percentual de cobertura, arquivos sem nenhum `data-testid`

### Interpretando os indicadores

| Símbolo | Significado                              |
|---------|------------------------------------------|
| `✓`     | Arquivo 100% coberto                     |
| `~`     | Cobertura parcial                        |
| `✗`     | Nenhum `data-testid` no arquivo          |
| `L42`   | Número da linha no arquivo               |

### Exemplo de saída

```
[PROJETO]  ████████░░░░░░░░░░░░░░░░░  8/21 (38%)
  ~ projeto/FilaTarefaPage.vue             2/3  (faltam 1)
       L20   <v-data-table>  <v-data-table ...
  ✓ projeto/PesquisaPage.vue              12/12
  ✗ projeto/HierarquiaPage.vue             0/1  (faltam 1)
       L2    <CrudComponent>  <CrudComponent ...
```
