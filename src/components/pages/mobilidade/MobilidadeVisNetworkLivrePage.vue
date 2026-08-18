<template>
  <ContainerComponent>
    <CardComponent
      max-width="1400"
      class="mx-auto"
    >
      <CardTitleComponent class="text-h5">
        Mobilidade do Workflow — Visão Livre (vis-network, estilo DOT playground)
      </CardTitleComponent>
      <CardTextComponent>
        <div
          v-if="carregando"
          class="estado-wrapper"
        >
          <ProgressCircularComponent
            indeterminate
            color="primary"
            size="48"
          />
        </div>

        <AlerComponent
          v-else-if="erro"
          type="error"
          variant="tonal"
        >
          {{ erro }}
        </AlerComponent>

        <template v-else>
          <p class="descricao">
            Layout puramente físico (force-directed, sem hierarquia) — os nós se organizam
            livremente pela simulação de forças, como no
            <a
              href="https://visjs.github.io/vis-network/examples/network/data/dotLanguage/dotPlayground.html"
              target="_blank"
              rel="noopener"
            >playground de DOT do vis-network</a>. Tarefas de Encerramento aparecem como
            círculo duplo (equivalente ao <code>doublecircle</code> do Graphviz para estados finais).
          </p>

          <div class="controles">
            <div class="legenda">
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--avanco" />
                Avanço
              </span>
              <span class="legenda__item">
                <span class="legenda__linha legenda__linha--devolucao" />
                Devolução
              </span>
              <span
                v-for="macroprocesso in macroprocessos"
                :key="macroprocesso"
                class="legenda__item"
              >
                <span
                  class="legenda__bolinha"
                  :style="{ borderColor: corPorMacroprocesso(macroprocesso) }"
                />
                {{ macroprocesso }}
              </span>
            </div>

            <CheckboxComponent
              v-model="tiposVisiveis"
              :items="tipoItems"
              inline
            />
          </div>

          <div
            ref="containerRef"
            class="fluxo-wrapper"
          />
        </template>
      </CardTextComponent>
    </CardComponent>
  </ContainerComponent>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'
import ContainerComponent from '@/components/comuns/containers/ContainerComponent.vue'
import CardComponent from '@/components/comuns/cards/CardComponent.vue'
import CardTitleComponent from '@/components/comuns/cards/CardTitleComponent.vue'
import CardTextComponent from '@/components/comuns/cards/CardTextComponent.vue'
import CheckboxComponent from '@/components/comuns/forms/CheckboxComponent.vue'
import ProgressCircularComponent from '@/components/comuns/progress/ProgressCircularComponent.vue'
import AlerComponent from '@/components/comuns/alerts/AlerComponent.vue'
import { useMobilidadesRelatorio, MOBILIDADE_TIPO } from './data/mobilidadesRelatorioService.js'

const COR_AVANCO = '#3B82F6'
const COR_DEVOLUCAO = '#EF4444'
const MACROPROCESSO_FINAL = 'Encerramento'
const RAIO_NO = 16

const CORES_MACROPROCESSO = {
  Iniciação: '#8B5CF6',
  Planejamento: '#F59E0B',
  Execução: '#10B981',
  'Monitoramento e Controle': '#06B6D4',
  Encerramento: '#EC4899',
}
const corPorMacroprocesso = (macroprocesso) => CORES_MACROPROCESSO[macroprocesso] ?? '#4A6CF7'

// Quebra o nome da tarefa em linhas curtas (em vez de deixar o texto inteiro
// numa linha só) pra manter os círculos com um tamanho razoável mesmo com
// nomes longos — mesma ideia do label multi-linha da versão "Nomeada".
function quebrarLinhas(texto, maxCaracteres = 14) {
  const palavras = texto.split(' ')
  const linhas = []
  let linhaAtual = ''

  palavras.forEach((palavra) => {
    const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra
    if (tentativa.length > maxCaracteres && linhaAtual) {
      linhas.push(linhaAtual)
      linhaAtual = palavra
    } else {
      linhaAtual = tentativa
    }
  })
  if (linhaAtual) linhas.push(linhaAtual)

  return linhas.join('\n')
}

// Desenha um "doublecircle" à la Graphviz (dois anéis concêntricos), usado
// pelo DOT playground pra marcar estados finais/aceitadores — aqui aplicado
// às tarefas de Encerramento. vis-network não tem essa forma pronta, mas
// permite plugar um canvas renderer via shape:'custom' + ctxRenderer. Como o
// shape custom não faz o auto-fit que o 'circle' nativo faz pro label, o
// raio é calculado aqui a partir da largura/altura real do texto.
function ctxRendererCirculoDuplo({ ctx, x, y, style, label }) {
  const tamanhoFonte = style.font?.size ?? 10
  const linhas = (label ?? '').split('\n')
  const alturaLinha = tamanhoFonte * 1.2

  ctx.font = `${tamanhoFonte}px sans-serif`
  const larguraTexto = Math.max(0, ...linhas.map((linha) => ctx.measureText(linha).width))
  const alturaTexto = linhas.length * alturaLinha

  const raioInterno = Math.max(style.size ?? RAIO_NO, larguraTexto / 2 + 10, alturaTexto / 2 + 8)
  const raioExterno = raioInterno + 4

  return {
    drawNode: () => {
      ctx.lineWidth = style.borderWidth ?? 2
      ctx.strokeStyle = style.borderColor ?? '#4A6CF7'
      ctx.fillStyle = style.color ?? '#fff'

      ctx.beginPath()
      ctx.arc(x, y, raioExterno, 0, 2 * Math.PI)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, raioInterno, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      if (label) {
        ctx.fillStyle = style.font?.color ?? '#1F2937'
        ctx.font = `${tamanhoFonte}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const offsetInicial = -((linhas.length - 1) * alturaLinha) / 2
        linhas.forEach((linha, indice) => {
          ctx.fillText(linha, x, y + offsetInicial + indice * alturaLinha)
        })
      }
    },
    nodeDimensions: { width: raioExterno * 2, height: raioExterno * 2 },
  }
}

const tipoItems = [
  { text: 'Avanço', value: MOBILIDADE_TIPO.AVANCO },
  { text: 'Devolução', value: MOBILIDADE_TIPO.DEVOLUCAO },
]
const tiposVisiveis = ref([MOBILIDADE_TIPO.AVANCO, MOBILIDADE_TIPO.DEVOLUCAO])

const { buscarMobilidades } = useMobilidadesRelatorio()

const carregando = ref(true)
const erro = ref(null)
const macroprocessos = ref([])

let edgesBase = []
let edgesDataSet = null

// Só física, sempre — diferente das outras POCs vis-network deste projeto
// (que alternam hierárquico/físico), esta página existe justamente para a
// "visão livre": nenhum "level" fixo, a simulação de forças decide tudo.
const opcoes = {
  physics: {
    enabled: true,
    stabilization: { iterations: 300 },
    barnesHut: { gravitationalConstant: -6000, springLength: 160, springConstant: 0.02, avoidOverlap: 0.4 },
  },
  layout: { hierarchical: { enabled: false } },
  nodes: {
    shape: 'circle',
    font: { size: 10, multi: true, align: 'center' },
    color: { background: '#fff', border: '#4A6CF7' },
    borderWidth: 2,
    size: RAIO_NO,
  },
  edges: {
    // O smooth real vem por aresta (curvedCW/CCW, ver edgesBase) pra separar
    // avanço de devolução; aqui fica só um fallback.
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    width: 1,
    font: { size: 10, align: 'top', strokeWidth: 0 },
  },
  interaction: { navigationButtons: true, keyboard: true, hover: true },
}

const containerRef = ref(null)
let network = null

onMounted(async () => {
  try {
    const { tarefas, mobilidades } = await buscarMobilidades()
    macroprocessos.value = [...new Set(tarefas.map((tarefa) => tarefa.macroprocesso))]

    const nodesDataSet = new DataSet(
      tarefas.map((tarefa) => {
        const final = tarefa.macroprocesso === MACROPROCESSO_FINAL
        const cor = corPorMacroprocesso(tarefa.macroprocesso)

        return {
          id: String(tarefa.id),
          label: quebrarLinhas(tarefa.tarefa),
          title: `${tarefa.tarefa} — ${tarefa.processo} (${tarefa.macroprocesso})`,
          color: { background: '#fff', border: cor },
          ...(final ? { shape: 'custom', ctxRenderer: ctxRendererCirculoDuplo } : {}),
        }
      })
    )

    // No dado real, quase toda tarefa tem avanço e devolução ligando o MESMO
    // par de nós — com linha reta (smooth:false) as duas ficam sobrepostas e
    // só a última desenhada aparece. curvedCW/CCW arqueia cada sentido pra um
    // lado diferente, e o label mostra o tipo diretamente sobre a aresta
    // (como as transições rotuladas do exemplo do DOT playground).
    edgesBase = mobilidades.map((mobilidade) => {
      const avanco = mobilidade.tipoId === MOBILIDADE_TIPO.AVANCO
      const cor = avanco ? COR_AVANCO : COR_DEVOLUCAO

      return {
        id: `mob-${mobilidade.id}`,
        tipoId: mobilidade.tipoId,
        from: String(mobilidade.origemId),
        to: String(mobilidade.destinoId),
        label: avanco ? 'Avanço' : 'Devolução',
        color: { color: cor },
        font: { color: cor },
        smooth: { type: avanco ? 'curvedCW' : 'curvedCCW', roundness: 0.2 },
      }
    })

    edgesDataSet = new DataSet(edgesBase.filter((edge) => tiposVisiveis.value.includes(edge.tipoId)))

    carregando.value = false
    // O container só entra no DOM depois que "carregando" vira false (v-else);
    // sem o nextTick, containerRef.value ainda seria null aqui.
    await nextTick()
    network = new Network(containerRef.value, { nodes: nodesDataSet, edges: edgesDataSet }, opcoes)
  } catch (erroCapturado) {
    erro.value = erroCapturado.message || 'Não foi possível carregar as mobilidades do relatório.'
    carregando.value = false
  }
})

onBeforeUnmount(() => {
  network?.destroy()
  network = null
})

watch(tiposVisiveis, (tipos) => {
  edgesDataSet?.clear()
  edgesDataSet?.add(edgesBase.filter((edge) => tipos.includes(edge.tipoId)))
})
</script>

<style scoped>
.estado-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.descricao {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface), 0.7);
  margin-bottom: 16px;
}

.controles {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 8px;
}

.legenda__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legenda__linha {
  width: 28px;
  height: 3px;
  border-radius: 2px;
  display: inline-block;
}

.legenda__linha--avanco {
  background: #3B82F6;
}

.legenda__linha--devolucao {
  background: #EF4444;
}

.legenda__bolinha {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid;
  background: #fff;
  display: inline-block;
}

.fluxo-wrapper {
  height: 75vh;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
</style>
