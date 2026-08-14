import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormularioDinamicoSnapshotV1 from '@/components/form-dinamico/snapshot-versoes/v1.vue'

// RowComponent/ColComponent/ChipComponent são wrappers finos de v-row/v-col/v-chip;
// stubados aqui pra não depender de uma instância real do Vuetify.
const stubs = {
  RowComponent: { template: '<div><slot /></div>' },
  ColComponent: { template: '<div><slot /></div>' },
  ChipComponent: { template: '<span class="chip-stub"><slot /></span>' },
}

// Baseado num payload real emitido por FormularioDinamicoPorId.vue.
const dados = {
  nome: 'Eduardo',
  processo: 3,
  linguagem_programacao: ['python', 'php', 'java'],
  sexo: 'masculino',
}

const snapshot = {
  nome: {
    id: 1,
    label: 'Nome',
    type: 'text',
    pivot: { cols: 3 },
  },
  processo: {
    id: 2,
    label: 'Processo',
    type: 'select',
    pivot: { cols: 3 },
    campos_opcoes: [
      { value: 3, text: 'Análise de Viabilidade', selected: true },
    ],
  },
  linguagem_programacao: {
    id: 4,
    label: 'Linguagem de programação',
    type: 'checkbox',
    pivot: { cols: 3 },
    campos_opcoes: [
      { value: 'java', text: 'Java', selected: true },
      { value: 'php', text: 'PHP', selected: true },
      { value: 'go', text: 'Go', selected: false },
    ],
  },
  sexo: {
    id: 5,
    label: 'Sexo',
    type: 'radio',
    pivot: { cols: 3 },
    campos_opcoes: [
      { value: 'feminino', text: 'Feminino', selected: false },
      { value: 'masculino', text: 'Masculino', selected: true },
    ],
  },
}

function montar(props) {
  return mount(FormularioDinamicoSnapshotV1, { props, global: { stubs } })
}

describe('snapshot-versoes/v1.vue', () => {
  it('exibe o label e o valor bruto de um campo de texto', () => {
    const wrapper = montar({ snapshot: { nome: snapshot.nome }, dados })

    expect(wrapper.text()).toContain('Nome')
    expect(wrapper.text()).toContain('Eduardo')
  })

  it('exibe "—" quando o valor de um campo de texto é nulo ou vazio', () => {
    const wrapper = montar({ snapshot: { nome: snapshot.nome }, dados: { nome: '' } })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.text()).not.toContain('Eduardo')
  })

  it('renderiza como chip apenas as opções marcadas como selected', () => {
    const wrapper = montar({ snapshot: { linguagem_programacao: snapshot.linguagem_programacao }, dados })

    const chips = wrapper.findAll('.chip-stub').map(c => c.text())
    expect(chips).toEqual(['Java', 'PHP'])
    expect(wrapper.text()).not.toContain('Go')
  })

  it('não renderiza a opção não selecionada de um radio', () => {
    const wrapper = montar({ snapshot: { sexo: snapshot.sexo }, dados })

    const chips = wrapper.findAll('.chip-stub').map(c => c.text())
    expect(chips).toEqual(['Masculino'])
    expect(wrapper.text()).not.toContain('Feminino')
  })

  it('exibe "—" quando nenhuma opção selecionável está selecionada', () => {
    const semSelecao = {
      id: 9,
      label: 'Vazio',
      type: 'select',
      pivot: { cols: 12 },
      campos_opcoes: [{ value: 1, text: 'Opção', selected: false }],
    }
    const wrapper = montar({ snapshot: { vazio: semSelecao }, dados: {} })

    expect(wrapper.findAll('.chip-stub')).toHaveLength(0)
    expect(wrapper.text()).toContain('—')
  })

  it('resolve o label do switch a partir de trueValue/falseValue customizados', () => {
    const campoSwitch = {
      id: 10,
      label: 'Ativo',
      type: 'switch',
      pivot: { cols: 12 },
      trueLabel: 'Sim',
      falseLabel: 'Não',
      trueValue: 'S',
      falseValue: 'N',
    }

    const ligado = montar({ snapshot: { ativo: campoSwitch }, dados: { ativo: 'S' } })
    expect(ligado.text()).toContain('Sim')
    expect(ligado.text()).not.toContain('Não')

    const desligado = montar({ snapshot: { ativo: campoSwitch }, dados: { ativo: 'N' } })
    expect(desligado.text()).toContain('Não')
  })

  it('aplica a classe de grid a partir de pivot.cols', () => {
    const wrapper = montar({ snapshot: { processo: snapshot.processo }, dados })

    expect(wrapper.find('.v-col-3').exists()).toBe(true)
  })
})
