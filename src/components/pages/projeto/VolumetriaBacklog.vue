<template>
  <ContainerComponent fluid class="py-4">
    <div class="row-one">
      <CardComponent
          v-for="(item, idx) in cards"
          :key="keyOf(item, idx)"
          class="compact"
          rounded="xl"
          variant="elevated"
      >
        <CardTextComponent>
          <div class="header">
            <div class="badge" :class="{ total: idx === 0 }">
              {{ idx === 0 ? 'TOTAL' : `MP ${item.id}` }}
            </div>
            <div class="pct">{{ porcentagemText(item) }}</div>
          </div>

          <div class="name">
            {{ idx === 0 ? 'Totalizador' : item.processo }}
          </div>

          <div class="grid">
            <div>
              <div class="k">Quantidade</div>
              <div class="v">{{ Number(item.quantidade ?? 0) }}</div>
            </div>

            <div>
              <div class="k">Registros</div>
              <div class="v2">abertos</div>
            </div>
          </div>

          <DividerComponent class="my-3" />

          <div class="d-flex align-center justify-space-between">
            <div class="text-caption text-medium-emphasis">Progresso</div>
            <div class="text-caption font-weight-bold">{{ porcentagemText(item) }}</div>
          </div>

          <ProgressLinearComponent
              :model-value="porcentagem(item)"
              height="8"
              rounded
              :color="idx === 0 ? 'primary' : 'secondary'"
          />
        </CardTextComponent>
      </CardComponent>
    </div>
  </ContainerComponent>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import ProgressLinearComponent from "@/components/comuns/progress/ProgressLinearComponent.vue";
import CardTextComponent from "@/components/comuns/cards/CardTextComponent.vue";
import CardComponent from "@/components/comuns/cards/CardComponent.vue";
import ContainerComponent from "@/components/comuns/containers/ContainerComponent.vue";
import DividerComponent from '@/components/comuns/layout/DividerComponent.vue'
import api from "@/services/api.js"; "@/services/api";

const dadosPainel = ref([]);
const apiResponse = ref({
  data: [
    { total: 'total', quantidade: 100 },
    { id: 1, processo: 'MP - 1️⃣ Aquisição & Qualificação da Demanda', quantidade: 20 },
    { id: 2, processo: 'MP - 2️⃣ Planejamento do Projeto', quantidade: 40 },
    { id: 3, processo: 'MP - 3️⃣ Execução', quantidade: 10 },
    { id: 4, processo: 'MP - 4️⃣ Monitoramento & Controle', quantidade: 10 },
    { id: 5, processo: 'MP - 5️⃣ Encerramento & Lições Aprendidas', quantidade: 20 },
  ],
})


const cards = computed(() => {
  const items = dadosPainel.value ?? []
  const total = items.find(x => x?.total) ?? { total: 'total', quantidade: 0 }
  const list = items.filter(x => x?.id).slice(0, 6)
  return [total, ...list]
})

const totalQtd = computed(() => Number(cards.value?.[0]?.quantidade ?? 0) || 0)

function keyOf(item, idx) {
  return item?.total ? 'total' : (item?.id ?? idx)
}
function porcentagem(item) {
  const t = totalQtd.value
  const q = Number(item?.quantidade ?? 0) || 0
  if (!t) return 0
  return Math.min(100, Math.round((q / t) * 100))
}
function porcentagemText(item) {
  return `${porcentagem(item)}%`
}

onMounted(() => {
  const data = {
    "ctrl_workflow_id": 1,
    "ctrl_hierarquia_id": 1
  }
  apiResponse
  api.post('/wf/processos/volumetria-backlog', data).then(res => {
    dadosPainel.value = []
    let total = {
      quantidade: 0,
      total: 0
    }
    dadosPainel.value.push(total)
    res.data.data.forEach((item) => {
      dadosPainel.value.push(item)
      total.total += item.quantidade
      total.quantidade += item.quantidade

    })
    console.log(dadosPainel.value)
    console.log()
  })
})
</script>

<style scoped>
.row-one{
  display:flex;
  flex-wrap:nowrap;
  gap:16px;
  overflow-x:auto;
  padding-bottom:6px;
}

.compact{
  flex:1 1 0;
  min-width:240px;
  max-width:360px;
}

.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.badge{
  font-size:11px;
  font-weight:800;
  letter-spacing:.06em;
  padding:6px 10px;
  border-radius:999px;
  background: rgba(var(--v-theme-secondary), .14);
  color: rgba(var(--v-theme-secondary), 1);
}
.badge.total{
  background: rgba(var(--v-theme-primary), .14);
  color: rgba(var(--v-theme-primary), 1);
}

.pct{
  font-size:12px;
  font-weight:800;
  opacity:.85;
}

.name{
  margin-top:10px;
  font-weight:700;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
  min-height:44px;
}

.grid{
  margin-top:10px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}
.k{ font-size:12px; opacity:.7; }
.v{ font-size:26px; font-weight:900; line-height:1.1; }
.v2{ font-size:14px; font-weight:700; opacity:.9; }
</style>