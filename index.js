require('dotenv').config()
const Discord = require('discord.js');
const OthelloGame = require('./othello')

const client = new Discord.Client();

const drawGame = async (g) => {
    return new Discord.MessageAttachment(await g.draw(), 'game.png')
}

const config = {
    prefix: 'kg!'
}

let player1 = null
let player2 = null
let game = null

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.content.startsWith(config.prefix)) {
        const command = msg.content.slice(config.prefix.length)
        switch(command.split(' ')[0]) {
            case 'game': {
                const params = command.slice(5)
                const split = params.split(' ')

                const decks = split[0]
                const size = Number(split[1]) || 6

                game = new OthelloGame(size, decks)
                msg.reply('starting new game', await drawGame(game))
                break
            }
            case 'move': {
                const params = command.slice(5)
                const x = params[0].charCodeAt() - 97
                const y = Number(params[1]) - 1

                const placed = game.placePiece(x, y)
                if (placed) {
                    msg.reply('Here', await drawGame(game));
                } else {
                    msg.reply('Illegal move');
                }
                break
            }
            case 'guess': {
                const params = command.slice(6)
                const split = params.split(' ')
                const x = params[0].charCodeAt() - 97
                const y = Number(params[1]) - 1

                const code = game.guess(split[1], x, y)
                if (code === 0) {
                    msg.reply('Correct answer', await drawGame(game));
                } else {
                    const message = code === 1 ? 'Illegal placement' : 'Wrong answer, turn skipped'
                    msg.reply(message, await drawGame(game))
                }

                break
            }
            case 'pass':
                game.pass()
                msg.reply('Here', await drawGame(game));
                break
            case 'shuffle':
                game.shuffle()
                msg.reply('Here', await drawGame(game));
                break
            case 'draw':
                msg.reply('Here', await drawGame(game));
                break
            case 'check': {
                const params = command.slice(6)
                const x = params[0].charCodeAt() - 97
                const y = Number(params[1]) - 1

                msg.reply(JSON.stringify(game.kanjiBoard[x][y]))
                break
            }
            case 'end':
                let red = 0
                let blue = 0
                for (let i = 0; i < game.size; i++) {
                    for (let j = 0; j < game.size; j++) {
                        if (game.get(i, j) === 1) { red++ }
                        if (game.get(i, j) === -1) { blue++ }
                    }
                }

                msg.reply(`Red: ${red}, Blue: ${blue}`)
                break
            default:
                msg.reply('invalid command')
                break
        }
    }

    if (msg.content.match(/^[a-z][1-9]\s/g)) {
        const split = msg.content.split(' ')
        const x = msg.content[0].charCodeAt() - 97
        const y = Number(msg.content[1]) - 1

        const code = game.guess(split[1], x, y)
        if (code === 0) {
            msg.reply('Correct answer', await drawGame(game));
        } else {
            const message = code === 1 ? 'Illegal placement' : 'Wrong answer, turn skipped'
            msg.reply(message, await drawGame(game))
        }
    }
});

client.login(process.env.BOT_TOKEN);