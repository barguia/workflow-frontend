#!/usr/bin/env node
/**
 * analyze-components.js
 *
 * Analisa o acoplamento com o framework Vuetify nos arquivos .vue do projeto.
 *
 * Para cada arquivo fora de src/components/comuns/, verifica:
 *   - Quantas tags <v-*> são usadas diretamente no template
 *   - Quais dessas tags já possuem um componente wrapper em comuns/
 *     (uso "evitável" = acoplamento desnecessário ao framework)
 *   - Quais não possuem wrapper (uso "inevitável" = esperado)
 *
 * Uso:
 *   npm run analyze:components
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT   = join(fileURLToPath(import.meta.url), '..', '..')
const SRC    = join(ROOT, 'src')
const COMUNS = join(SRC, 'components', 'comuns')

// ─── helpers ────────────────────────────────────────────────────────────────

function walk(dir, skip = []) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files   = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (!skip.includes(full)) files.push(...walk(full, skip))
    } else if (e.name.endsWith('.vue')) {
      files.push(full)
    }
  }
  return files
}

function extractTemplate(src) {
  return src.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? ''
}

/** Retorna os nomes únicos de tags <v-*> presentes no template */
function vuetifyTagsIn(template) {
  return [...new Set([...template.matchAll(/<(v-[a-z][a-z0-9-]*)/g)].map(m => m[1]))]
}

/** Retorna os nomes de componentes importados de @/components/comuns/ */
function comunsImportsIn(src) {
  return [...src.matchAll(/from\s+['"]@\/components\/comuns\/[^'"]+\/([A-Z][^'"]+)\.vue['"]/g)]
    .map(m => m[1])
}

// ─── 1. Mapeamento automático: wrapper → tag vuetify ─────────────────────────

const wrapperToTag = {}   // 'ButtonComponent'  → 'v-btn'
const tagToWrapper = {}   // 'v-btn'             → ['ButtonComponent']

for (const file of walk(COMUNS)) {
  const name    = file.split('/').pop().replace('.vue', '')
  const content = readFileSync(file, 'utf-8')
  const tags    = vuetifyTagsIn(extractTemplate(content))
  if (tags.length) {
    wrapperToTag[name] = tags[0]
    ;(tagToWrapper[tags[0]] ??= []).push(name)
  }
}

// ─── 2. Análise dos arquivos do projeto ──────────────────────────────────────

const projectFiles = walk(SRC, [COMUNS])
const results = []

for (const file of projectFiles) {
  const content  = readFileSync(file, 'utf-8')
  const template = extractTemplate(content)

  const directTags     = vuetifyTagsIn(template)
  const wrapperImports = comunsImportsIn(content)

  // Tags que têm wrapper disponível mas foram usadas diretamente
  const avoidable   = directTags.filter(t => tagToWrapper[t])
  // Tags sem wrapper (inevitável usar o framework diretamente)
  const unavoidable = directTags.filter(t => !tagToWrapper[t])

  results.push({
    file:          relative(SRC, file),
    directTags,
    wrapperImports,
    avoidable,
    unavoidable,
    coupled:       avoidable.length > 0,
  })
}

// ─── 3. Estatísticas globais ─────────────────────────────────────────────────

const total         = results.length
const decoupled     = results.filter(r => !r.coupled).length
const coupled       = total - decoupled
const coupledPct    = ((coupled   / total) * 100).toFixed(1)
const decoupledPct  = ((decoupled / total) * 100).toFixed(1)

// Frequência de cada tag evitável no projeto inteiro
const tagFrequency = {}
for (const r of results) {
  for (const tag of r.avoidable) {
    tagFrequency[tag] = (tagFrequency[tag] ?? 0) + 1
  }
}
const topTags = Object.entries(tagFrequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)

// Arquivos mais acoplados (mais tags evitáveis distintas)
const mostCoupled = [...results]
  .filter(r => r.coupled)
  .sort((a, b) => b.avoidable.length - a.avoidable.length)
  .slice(0, 10)

// ─── 4. Relatório ────────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
}

function bar(pct, width = 30) {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

console.log(`\n${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
console.log(`${C.bold}  Análise de Acoplamento com Vuetify — Frontend${C.reset}`)
console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`)

// ── Resumo geral ──
console.log(`${C.cyan}${C.bold}▸ Resumo geral${C.reset}`)
console.log(`  Arquivos .vue analisados : ${C.bold}${total}${C.reset}`)
console.log(`  Wrappers disponíveis     : ${C.bold}${Object.keys(wrapperToTag).length}${C.reset}  (mapeados automaticamente de src/components/comuns/)`)
console.log()

const decoupledColor = parseFloat(decoupledPct) >= 70 ? C.green : parseFloat(decoupledPct) >= 40 ? C.yellow : C.red
const coupledColor   = parseFloat(coupledPct)   <= 30 ? C.green : parseFloat(coupledPct)   <= 60 ? C.yellow : C.red

console.log(`  ${C.green}Desacoplados${C.reset}  ${decoupledColor}${bar(parseFloat(decoupledPct))}${C.reset}  ${decoupledColor}${decoupledPct}%${C.reset}  (${decoupled} arquivos — sem uso evitável de Vuetify)`)
console.log(`  ${C.red}Acoplados${C.reset}     ${coupledColor}${bar(parseFloat(coupledPct))}${C.reset}  ${coupledColor}${coupledPct}%${C.reset}  (${coupled} arquivos — usam <v-*> com wrapper disponível)`)
console.log()

// ── Top tags evitáveis ──
if (topTags.length) {
  console.log(`${C.cyan}${C.bold}▸ Tags Vuetify mais usadas diretamente (com wrapper disponível)${C.reset}`)
  console.log(`  ${C.dim}Estas são candidatas prioritárias para substituição${C.reset}\n`)
  for (const [tag, count] of topTags) {
    const wrappers = (tagToWrapper[tag] ?? []).join(', ')
    const pct      = ((count / coupled) * 100).toFixed(0)
    console.log(`  ${C.yellow}${tag.padEnd(28)}${C.reset}  ${String(count).padStart(3)} arquivos  →  use ${C.green}${wrappers}${C.reset}`)
  }
  console.log()
}

// ── Arquivos mais acoplados ──
if (mostCoupled.length) {
  console.log(`${C.cyan}${C.bold}▸ Arquivos com maior acoplamento direto${C.reset}`)
  console.log(`  ${C.dim}Ordenados por número de tags Vuetify distintas com wrapper disponível${C.reset}\n`)
  for (const r of mostCoupled) {
    const tags = r.avoidable.join(', ')
    console.log(`  ${C.white}${r.file.padEnd(65)}${C.reset}  ${C.red}${r.avoidable.length} tag(s)${C.reset}`)
    console.log(`    ${C.dim}${tags}${C.reset}`)
  }
  console.log()
}

// ── Arquivos completamente desacoplados ──
const decoupledFiles = results.filter(r => !r.coupled && r.directTags.length === 0)
console.log(`${C.cyan}${C.bold}▸ Arquivos sem nenhum uso direto de Vuetify${C.reset}  ${C.dim}(${decoupledFiles.length} arquivos)${C.reset}`)
for (const r of decoupledFiles) {
  console.log(`  ${C.green}✓${C.reset}  ${r.file}`)
}
console.log()

// ── Wrappers mapeados ──
console.log(`${C.cyan}${C.bold}▸ Mapeamento de wrappers detectado automaticamente${C.reset}`)
const wrapperEntries = Object.entries(wrapperToTag).sort((a, b) => a[1].localeCompare(b[1]))
const colSize = Math.max(...wrapperEntries.map(([k]) => k.length)) + 2
for (const [comp, tag] of wrapperEntries) {
  console.log(`  ${C.green}${comp.padEnd(colSize)}${C.reset}  →  ${C.yellow}${tag}${C.reset}`)
}
console.log()

console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`)
