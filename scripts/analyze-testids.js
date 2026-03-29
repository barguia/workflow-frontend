#!/usr/bin/env node
/**
 * analyze-testids.js
 *
 * Analisa a cobertura de data-testid nos componentes de página (.vue).
 *
 * Para cada arquivo em src/components/pages/, verifica:
 *   - Quantos elementos interativos existem no template
 *   - Quantos já possuem data-testid
 *   - Quais estão faltando (tag + linha)
 *
 * Uso:
 *   npm run analyze:testids
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT  = join(fileURLToPath(import.meta.url), '..', '..')
const PAGES = join(ROOT, 'src', 'components', 'pages')

// Tags consideradas interativas para fins de testabilidade e2e
const INTERACTIVE_TAGS = new Set([
  // Vuetify
  'v-btn', 'v-btn-toggle',
  'v-text-field', 'v-select', 'v-combobox', 'v-autocomplete',
  'v-textarea', 'v-checkbox', 'v-radio-group', 'v-switch',
  'v-data-table', 'v-data-table-virtual',
  'v-list-item',
  // HTML nativo
  'a', 'button', 'input', 'select', 'textarea',
  // Wrappers do projeto
  'ButtonComponent', 'TextFieldComponent', 'SelectComponent',
  'ComboboxComponent', 'TextAreaComponent', 'CheckboxComponent',
  'RadioComponent', 'CrudDataTableComponent', 'CrudComponent',
])

// ─── helpers ─────────────────────────────────────────────────────────────────

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (e.name.endsWith('.vue')) files.push(full)
  }
  return files.sort()
}

function extractTemplate(src) {
  return src.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? ''
}

/**
 * Varre o template linha a linha, coleta tags multilinhas e
 * retorna lista de { tag, line, hasTestId, snippet }.
 */
function findInteractiveElements(template) {
  const lines = template.split('\n')
  const results = []

  for (let i = 0; i < lines.length; i++) {
    for (const tag of INTERACTIVE_TAGS) {
      const openTag = new RegExp(`<${tag}(\\s|>|/)`)
      if (!openTag.test(lines[i])) continue

      // Coleta linhas até fechar o elemento de abertura.
      // Usa linha que (após trim) seja apenas ">" ou "/>" para indicar fim da tag,
      // evitando parar em "=>" dentro de atributos.
      let tagContent = lines[i]
      let j = i
      const MAX_LINES = 25
      while (j < lines.length - 1 && j - i < MAX_LINES) {
        const trimmed = lines[j].trim()
        if (trimmed === '>' || trimmed === '/>') break
        if (j > i && /^[^"'`]*>/.test(trimmed) && !trimmed.includes('=>')) break
        j++
        tagContent += ' ' + lines[j]
      }

      results.push({
        tag,
        line: i + 1,
        hasTestId: tagContent.includes('data-testid') || tagContent.includes(':data-testid'),
        snippet: lines[i].trim().slice(0, 70),
      })
    }
  }

  return results
}

// ─── análise ─────────────────────────────────────────────────────────────────

const files = walk(PAGES)
const fileReports = []

for (const file of files) {
  const content  = readFileSync(file, 'utf-8')
  const template = extractTemplate(content)
  const elements = findInteractiveElements(template)

  if (elements.length === 0) continue

  const withTestId = elements.filter(e => e.hasTestId).length
  fileReports.push({ file, elements, withTestId, total: elements.length })
}

// ─── relatório ───────────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
}

const bar = (pct, width = 25) => {
  const filled = Math.round((pct / 100) * width)
  return C.green + '█'.repeat(filled) + C.dim + '░'.repeat(width - filled) + C.reset
}

const pctColor = (pct) =>
  pct === 100 ? C.green : pct >= 50 ? C.yellow : C.red

console.log(`\n${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
console.log(`${C.bold}  Cobertura de data-testid — Páginas (src/components/pages/)${C.reset}`)
console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`)

// Agrupa por subpasta dentro de pages/
const groups = {}
for (const report of fileReports) {
  const rel   = relative(PAGES, report.file)
  const parts = rel.split('/')
  const group = parts.length > 1 ? parts[0] : '.'
  ;(groups[group] ??= []).push({ ...report, rel })
}

let grandTotal = 0
let grandWithTestId = 0

for (const [group, reports] of Object.entries(groups).sort()) {
  const gTotal = reports.reduce((s, r) => s + r.total, 0)
  const gWith  = reports.reduce((s, r) => s + r.withTestId, 0)
  const gPct   = Math.round((gWith / gTotal) * 100)

  grandTotal       += gTotal
  grandWithTestId  += gWith

  const label = group === '.' ? 'raiz' : group
  console.log(`${C.cyan}${C.bold}[${label.toUpperCase()}]${C.reset}  ${bar(gPct)}  ${pctColor(gPct)}${gWith}/${gTotal} (${gPct}%)${C.reset}`)

  for (const { rel, elements, withTestId, total } of reports) {
    const pct       = Math.round((withTestId / total) * 100)
    const indicator = pct === 100 ? `${C.green}✓${C.reset}` : pct === 0 ? `${C.red}✗${C.reset}` : `${C.yellow}~${C.reset}`
    const missing   = total - withTestId

    console.log(`  ${indicator} ${rel.padEnd(55)} ${pctColor(pct)}${withTestId}/${total}${C.reset}  ${missing > 0 ? C.dim + `(faltam ${missing})` + C.reset : ''}`)

    // Lista os elementos sem data-testid
    for (const el of elements.filter(e => !e.hasTestId)) {
      console.log(`       ${C.dim}L${String(el.line).padEnd(4)}${C.reset} ${C.yellow}<${el.tag}>${C.reset}  ${C.dim}${el.snippet}${C.reset}`)
    }
  }

  console.log()
}

// ─── resumo ──────────────────────────────────────────────────────────────────

const totalMissing = grandTotal - grandWithTestId
const totalPct     = grandTotal > 0 ? Math.round((grandWithTestId / grandTotal) * 100) : 100
const filesOk      = fileReports.filter(r => r.withTestId === r.total).length
const filesNone    = fileReports.filter(r => r.withTestId === 0).length

console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
console.log(`${C.bold}  RESUMO${C.reset}`)
console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
console.log(`  Arquivos analisados       : ${C.bold}${fileReports.length}${C.reset}`)
console.log(`  Elementos interativos     : ${C.bold}${grandTotal}${C.reset}`)
console.log(`  Com data-testid           : ${C.green}${grandWithTestId}${C.reset}  ${bar(totalPct, 20)}  ${pctColor(totalPct)}${totalPct}%${C.reset}`)
console.log(`  Sem data-testid           : ${C.red}${totalMissing}${C.reset}`)
console.log(`  Arquivos 100% cobertos    : ${C.green}${filesOk}${C.reset}`)
console.log(`  Arquivos sem nenhum testid: ${C.red}${filesNone}${C.reset}`)
console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`)
