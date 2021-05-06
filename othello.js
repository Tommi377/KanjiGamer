const helper = require('./helper')
const Canvas = require('canvas');
const Wanakana = require('wanakana');

const imagePath = './resources/images/'

// -1 = Black, 0 = Empty, 1 = White
module.exports = class OthelloGame {
    constructor(size = 8, decks = '1k+j1k+2k+j2k') {
        this.size = size
        this.decks = decks
        this.kanjiBoard = helper.generateKanjiBoard(size, decks)

        this.board = Array(size).fill().map(() => Array(size).fill(0))
        this.board[size/2-1][size/2-1] = 1
        this.board[size/2-1][size/2] = -1
        this.board[size/2][size/2-1] = -1
        this.board[size/2][size/2] = 1

        this.turn = -1
        this.passed = false
        this.ended = false

        this.moveU = (v) => { v[1] -= 1 }
        this.moveR = (v) => { v[0] += 1 }
        this.moveD = (v) => { v[1] += 1 }
        this.moveL = (v) => { v[0] -= 1 }
        this.moveUR = (v) => { v[0] += 1 ; v[1] -= 1 }
        this.moveDR = (v) => { v[0] += 1 ; v[1] += 1 }
        this.moveDL = (v) => { v[0] -= 1 ; v[1] += 1 }
        this.moveUL = (v) => { v[0] -= 1 ; v[1] -= 1 }
        this.dirFuncs = [this.moveU, this.moveR, this.moveD, this.moveL, this.moveUR, this.moveDR, this.moveDL, this.moveUL]

    }

    get current() { return this.turn }
    get enemy() { return -this.turn }
    get empty() { return 0 }

    get(x, y) { return this.board[y][x] }

    outOfBounds(x, y) {
        return x < 0 || y < 0 || x >= 8 || y >= 8
    }

    getCaptures(x,y) {
        // left to right
        console.log("getCaptures at", x, y)
        let capture = []
        for(let i = 0; i < 8; i++) {
            const func = this.dirFuncs[i]
            
            const v = [x, y]
            let enemies = []
            let exit = false
            func(v)
            while (!this.outOfBounds(v[0], v[1]) && !exit) {
                // console.log(i, v)
                if (this.get(v[0], v[1]) === this.enemy) {
                    enemies.push([v[0], v[1]])
                    func(v)
                } else if (this.get(v[0], v[1]) === this.current && enemies.length) {
                    capture.push(...enemies)
                    exit = true
                } else {
                    exit = true
                }
            }
        }
        return capture
    }

    placePiece(x, y) {
        console.log(x, y)
        if (this.ended) {
            return false
        }

        const captures = this.getCaptures(x, y)
        if (!captures.length) {
            return false
        }

        captures.forEach(v => {
            this.board[v[1]][v[0]] = this.turn
        })

        this.board[y][x] = this.turn


        this.turn = -this.turn
        this.passed = false

        console.log(this.board)

        return true
    }

    // 0 = Correct and Legal
    // 1 = Illegal placement
    // 2 = Wrong answer
    guess(str, x, y) {
        const guess = Wanakana.isRomaji(str) ? Wanakana.toKana(str) : str
        const card = this.kanjiBoard[x][y]

        if (card.answer.includes(guess)) {

            const placed = this.placePiece(x, y)
            if (placed) {
                return 0
            } else {
                return 1
            }
        } else {
            this.pass()
            return 2
        }
    }

    // false = shuffle
    pass(forced = false) {
        if (this.passed && !forced) {
            this.shuffle()
            this.turn = -this.turn
            this.passed = false
            return false
        }

        this.turn = -this.turn
        this.passed = !forced
        return true
    }

    // This is shit
    shuffle() {
        const newKanjiBoard = helper.generateKanjiBoard(this.size, this.decks)

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.get(i,j) === this.empty) {
                    this.kanjiBoard[i][j] = newKanjiBoard[i][j]
                }
            }
        }
    }

    async draw() {
        const tileSize = 128
        const offset = tileSize / 16

        const boardXOffset = 32
        const boardYOffset = 32

        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
        
            // Declare a base size of the font
            let fontSize = 64;
        
            do {
                // Assign the font to the context and decrement it so it can be measured again
                context.font = `${fontSize -= 8}px sans-serif`;
            } while (context.measureText(text).width > tileSize - offset * 2);
        
            // Return the result to use in the actual canvas
            return context.font;
        };

        const canvas = Canvas.createCanvas(this.size * tileSize + boardXOffset, this.size * tileSize + boardYOffset)
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, this.size * tileSize + boardXOffset, this.size * tileSize + boardYOffset);

        context.fillStyle = this.turn === 1 ? '#ff3838' : '#3849ff'
        context.fillRect(0, 0, boardXOffset, boardYOffset);

        for (let i = 0; i < this.size; i++) {
            context.font = `32px sans-serif`;
            context.fillStyle = '#ffffff';
            context.fillText(String.fromCharCode(i + 97), boardXOffset + i * tileSize + tileSize / 2 - 8, boardYOffset * 0.7);
            context.fillText(i + 1, boardXOffset * 0.25, boardYOffset + i * tileSize + tileSize / 2 + 8);

        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                context.fillStyle = '#ffb078';
                context.strokeStyle = '#000000';
                context.lineWidth = 4
                context.fillRect(boardXOffset + i * tileSize, boardYOffset + j * tileSize, tileSize, tileSize);
                context.strokeRect(boardXOffset + i * tileSize, boardYOffset + j * tileSize, tileSize, tileSize);
                switch (this.get(i, j)) {
                    case 1:
                        context.fillStyle = '#ff3838';
                        context.fillRect(boardXOffset + i * tileSize + offset, boardYOffset + j * tileSize + offset, tileSize - 2 * offset, tileSize - 2 * offset);
                        break
                    case -1:
                        context.fillStyle = '#3849ff';
                        context.fillRect(boardXOffset + i * tileSize + offset, boardYOffset + j * tileSize + offset, tileSize - 2 * offset, tileSize - 2 * offset);
                        break
                    default:
                        //context.drawImage(p0, i * tileSize, j * tileSize, tileSize, tileSize);
                        break
                }
                
                const question = this.kanjiBoard[i][j].question
                context.fillStyle = '#ffffff';
                if (question.length > 2) {
                    console.log(question)
                    var middle = Math.ceil(question.length / 2);
                    var s1 = question.substr(0, middle);
                    var s2 = question.substr(middle);
                    context.font = applyText(canvas, s2);
                    context.fillText(s1, boardXOffset + i * tileSize + offset, boardYOffset + j * tileSize + (tileSize * 0.85) / 2);
                    context.fillText(s2, boardXOffset + i * tileSize + offset, boardYOffset + j * tileSize + (tileSize * 1.75) / 2);
                } else {
                    context.font = applyText(canvas, this.kanjiBoard[i][j].question);
                    context.fillText(this.kanjiBoard[i][j].question, boardXOffset + i * tileSize + offset, boardYOffset + j * tileSize + (tileSize * 1.25) / 2);
                }
            }
        }
        
        return canvas.toBuffer()
    }
}