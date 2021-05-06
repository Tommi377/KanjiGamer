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

                const size = Number(split[0]) || 6
                const decks = split[1] || '1k+j1k+2k+j2k'

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
                    const message = code == 1 ? 'Illegal placement' : 'Wrong answer, turn skipped'
                    msg.reply(message, await drawGame(game))
                }

                break
            }
            case 'shuffle':
                game.shuffle()
                msg.reply('Here', await drawGame(game));
                break
            case 'draw':
                msg.reply('Here', await drawGame(game));
                break
            default:
                msg.reply('invalid command')
                break
        }
    }
});

client.login(process.env.BOT_TOKEN);