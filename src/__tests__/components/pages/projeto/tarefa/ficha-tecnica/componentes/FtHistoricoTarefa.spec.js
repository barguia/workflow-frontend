import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FtHistoricoTarefa from '@/components/pages/projeto/tarefa/ficha-tecnica/componentes/FtHistoricoTarefa.vue'

// Todos os wrappers de comuns/ e as tags Vuetify usadas direto (v-switch, v-timeline*)
// são stubados como elementos simples, sem depender de uma instância real do Vuetify.
// Atributos/props não declarados no stub (color, data-testid, etc.) caem via fallthrough
// automático do Vue no elemento raiz — por isso dá pra inspecioná-los depois.
const stubs = {
  CardComponent: { template: '<div><slot /></div>' },
  ButtonComponent: { template: '<button class="btn-stub"><slot /></button>' },
  IconComponent: { template: '<i class="icon-stub"><slot /></i>' },
  SpacerComponent: { template: '<div class="spacer-stub"></div>' },
  ChipComponent: { template: '<span class="chip-stub"><slot /></span>' },
  ProgressCircularComponent: { template: '<div class="progress-stub"></div>' },
  FormularioDinamicoSnapshot: { template: '<div class="snapshot-stub"></div>' },
  'v-switch': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input type="checkbox" class="switch-stub" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
  },
  'v-timeline': { template: '<div><slot /></div>' },
  'v-timeline-item': { template: '<div class="timeline-item-stub"><slot /></div>' },
}

function montar(props) {
  return mount(FtHistoricoTarefa, { props, global: { stubs } })
}

const manualComFormulario = {
  pco_tratamento_id: 19,
  sistemico: 0,
  tratamento: 'Avançar',
  tarefa_origem: 'Registrar solicitação do projeto',
  tarefa_destino: 'Descrever problema/oportunidade',
  usuario_tratamento: 'Eduardo Barbelino da Purificação',
  created_at: '2026-08-14 13:06:39',
  finalized_at: '2026-08-14 13:07:00',
  descricao: 'testes testes',
  dados_formulario: JSON.stringify({ nome: 'Eduardo' }),
  snapshot_formulario: JSON.stringify({ nome: { id: 1, label: 'Nome', type: 'text', cols: 12, value: 'Eduardo' } }),
  snapshot_version: 1,
}

const manualSemFormulario = {
  pco_tratamento_id: 18,
  sistemico: 0,
  tratamento: 'Retroceder',
  tarefa_origem: 'Descrever problema/oportunidade',
  tarefa_destino: null,
  usuario_tratamento: 'Eduardo Barbelino da Purificação',
  created_at: '2026-08-14 13:06:37',
  finalized_at: null,
  descricao: null,
  dados_formulario: null,
  snapshot_formulario: null,
  snapshot_version: null,
}

const sistemico = {
  pco_tratamento_id: 17,
  sistemico: 1,
  tratamento: 'Adotar',
  tarefa_origem: 'Registrar solicitação do projeto',
  tarefa_destino: null,
  usuario_tratamento: 'Eduardo Barbelino da Purificação',
  created_at: '2026-08-14 13:06:30',
  finalized_at: '2026-08-14 13:06:30',
  descricao: null,
  dados_formulario: null,
  snapshot_formulario: null,
  snapshot_version: null,
}

const comSnapshotInvalido = {
  pco_tratamento_id: 20,
  sistemico: 0,
  tratamento: 'Tipo desconhecido',
  tarefa_origem: 'Origem X',
  tarefa_destino: null,
  usuario_tratamento: 'Usuário',
  created_at: '2026-08-14 13:08:00',
  finalized_at: '2026-08-14 13:08:10',
  descricao: null,
  dados_formulario: '{"nome":"X"}',
  snapshot_formulario: '{"nome": isso não é json',
  snapshot_version: 1,
}

describe('FtHistoricoTarefa.vue', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra o estado vazio quando não há tratamentos', () => {
    const wrapper = montar({ tratamentos: [] })

    expect(wrapper.text()).toContain('Nenhum tratamento registrado.')
    expect(wrapper.find('.timeline-item-stub').exists()).toBe(false)
  })

  it('mostra o indicador de carregamento em vez da lista', () => {
    const wrapper = montar({ tratamentos: [manualComFormulario], carregando: true })

    expect(wrapper.find('.progress-stub').exists()).toBe(true)
    expect(wrapper.find('.timeline-item-stub').exists()).toBe(false)
  })

  it('filtra tratamentos sistêmicos por padrão', () => {
    const wrapper = montar({ tratamentos: [manualComFormulario, sistemico] })

    expect(wrapper.findAll('.timeline-item-stub')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Adotar')
  })

  it('exibe tratamentos sistêmicos quando o switch "Exibir automáticos" é ativado', async () => {
    const wrapper = montar({ tratamentos: [manualComFormulario, sistemico] })

    await wrapper.find('.switch-stub').setValue(true)

    expect(wrapper.findAll('.timeline-item-stub')).toHaveLength(2)
    expect(wrapper.text()).toContain('Adotar')
  })

  it('aplica a cor conhecida por tipo de tratamento e "secondary" como fallback', () => {
    const wrapper = montar({ tratamentos: [manualComFormulario, comSnapshotInvalido] })

    const itens = wrapper.findAll('.timeline-item-stub')
    expect(itens[0].find('.chip-stub').attributes('color')).toBe('primary') // Avançar
    expect(itens[1].find('.chip-stub').attributes('color')).toBe('secondary') // tipo desconhecido
  })

  it('formata created_at/finalized_at e usa "—" quando a data é nula', () => {
    const wrapper = montar({ tratamentos: [manualSemFormulario] })

    const esperado = new Date(manualSemFormulario.created_at).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    expect(wrapper.text()).toContain(esperado)
    expect(wrapper.text()).toContain('—')
  })

  it('só mostra o botão de ver formulário quando dados e snapshot existem', () => {
    const wrapper = montar({ tratamentos: [manualComFormulario, manualSemFormulario] })

    expect(wrapper.findAll('[data-testid="ft-historico-toggle-formulario"]')).toHaveLength(1)
  })

  it('alterna a exibição do formulário preenchido ao clicar no botão', async () => {
    const wrapper = montar({ tratamentos: [manualComFormulario] })

    expect(wrapper.find('.snapshot-stub').exists()).toBe(false)

    const botao = wrapper.find('[data-testid="ft-historico-toggle-formulario"]')
    expect(botao.text()).toContain('Ver formulário preenchido')

    await botao.trigger('click')
    expect(wrapper.find('.snapshot-stub').exists()).toBe(true)
    expect(botao.text()).toContain('Ocultar formulário preenchido')

    await botao.trigger('click')
    expect(wrapper.find('.snapshot-stub').exists()).toBe(false)
  })

  it('loga um aviso e oculta o botão quando snapshot_formulario é JSON inválido', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = montar({ tratamentos: [comSnapshotInvalido] })

    expect(wrapper.find('[data-testid="ft-historico-toggle-formulario"]').exists()).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(String(comSnapshotInvalido.pco_tratamento_id)),
      expect.any(Error),
    )
  })

  it('emite "atualizar" ao clicar no botão Atualizar', async () => {
    const wrapper = montar({ tratamentos: [] })

    await wrapper.find('[data-testid="ft-historico-btn-atualizar"]').trigger('click')

    expect(wrapper.emitted('atualizar')).toHaveLength(1)
  })
})
