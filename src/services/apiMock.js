// src/services/apiMock.js
const delay = (ms) => new Promise(r => setTimeout(r, ms))

const ESTADOS = [
    { text: 'São Paulo', value: 1 },
    { text: 'Rio de Janeiro', value: 2 },
    { text: 'Minas Gerais', value: 3 },
]

const INTERESSES = [
    { text: 'Tecnologia', value: 1 },
    { text: 'Infraestrutura', value: 2 },
    { text: 'Inteligência Artificial', value: 3 },
]

const CIDADES = {
    1: [
        { text: 'São Paulo', value: 101 },
        { text: 'Campinas', value: 102 },
        { text: 'Santos', value: 103 },
    ],
    2: [
        { text: 'Rio de Janeiro', value: 201 },
        { text: 'Niterói', value: 202 },
    ],
    3: [
        { text: 'Belo Horizonte', value: 301 },
    ],
}

const api = {
    async get(url) {
        await delay(300)

        if (url === '/estados') return ESTADOS
        if (url === '/interesses') return INTERESSES

        const match = url.match(/\/cidades\?estado_id=(\d+)/)
        if (match) {
            const id = parseInt(match[1])
            return CIDADES[id] || []
        }

        throw new Error('Rota não encontrada')
    }
}

export default api