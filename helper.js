const fs = require('fs');

const dataPath = './resources/decks/'

const getRandomUnique = (max, used) => {
    while (true) {
        const rng = Math.floor(Math.random() * max)
        if (!used.includes(rng)) {
            used.push(rng)
            return rng
        }
    }
} 

const generateKanjiBoard = (size, command) => {
    const board = Array(size).fill().map(() => Array(size).fill(null))
    const cards = []
    const categories = command.split('+')
    
    categories.forEach(category => {
        console.log(dataPath + category + '.json')
        const raw = fs.readFileSync(dataPath + category + '.json')
        let data = JSON.parse(raw)
        const name = data.name
        cards.push(...data.cards.map(c => ({ name, ...c })))
    });

    const used = []
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const index = getRandomUnique(cards.length, used)
            board[i][j] = cards[index]
        }
    }

    return board
}

module.exports = { generateKanjiBoard }