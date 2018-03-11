let BOT
let entered
let pick

const createPick = async (message) => {
  if (!message.guild) { return }
  if (await BOT.isOp(message) === false) { return }

  const homeID = await BOT.database.getServerData(message.guild.id, 'home')
  console.log(homeID)
  if (homeID === undefined) {
    BOT.send(message.channel, {
      title: 'Usage Error',
      description: `Please set a home channel first using \`!setHome\``,
      color: BOT.colors.red
    })
    return
  }

  let amountWinners = parseInt(message.content.split(' ')[1])
  if (!amountWinners) {
    BOT.send(message.channel, {
      title: 'Usage Error',
      description: `Usage: \`!createPick <Amount of Winners> <Title>\``,
      color: BOT.colors.red
    })
    return
  }

  let title = message.content.split(' ').slice(2).join(' ')
  if (!title || title.length < 2) {
    BOT.send(message.channel, {
      title: 'Usage Error',
      description: `Usage: \`!createPick <Amount of Winners> <Title>\``,
      color: BOT.colors.red
    })
    return
  }

  let killerRole = await BOT.database.getServerData(pick.guildID, 'role_killer')
  let killers = message.guild.roles.get(killerRole)
  if (killers) {
    killers.members.forEach(killer => {
      killer.removeRole(killerRole)
    })
  }

  let pickMsg = await BOT.send(message.guild.channels.get(homeID), {
    title: title,
    description: `${amountWinners} winners. React to enter`,
    footer: {text: '24 hours and 0 minutes remaining'},
    color: BOT.colors.blue
  })

  pickMsg.react('🎉')

  const minutes = 60 * 24
  const ends = new Date(new Date(Date.now()).getTime() + minutes * 60000)

  pick = { guildID: message.guild.id, channelID: homeID, messageID: pickMsg.id, amountWinners, ends }
  entered = { users: { } }

  await BOT.database.setServerData('GLOBAL', 'running_pick', pick)
  await BOT.database.setServerData('GLOBAL', 'running_pick_entered', { users: { } })
  // console.log(reactionMsg)
}

const onReactAdd = async (reaction, user) => {
  if (reaction.message.id !== pick.messageID) { return }

  entered.users[user.id] = { entered: true }
  console.log(entered)
  await BOT.database.setServerData('GLOBAL', 'running_pick_entered', entered)
}

const onReactRemove = async (reaction, user) => {
  if (reaction.message.id !== pick.messageID) { return }

  entered[user.id] = { entered: false }
  console.log(entered)
  await BOT.database.setServerData('GLOBAL', 'running_pick_entered', entered)
}

const init = (bot) => {
  BOT = bot

  BOT.on('FUNC_dbReady', () => {
    BOT.database.getServerData('GLOBAL', 'running_pick_entered')
      .then((data) => {
        entered = data
        if (entered === undefined) { entered = { users: { } } }
      })
    BOT.database.getServerData('GLOBAL', 'running_pick')
      .then((data) => {
        pick = data
        if (pick === undefined) { pick = {guildID: 'null', channelID: 'null', messageID: 'null', ends: new Date()} }
      })
  })

  BOT.register('!createPick', createPick)
  BOT.on('FUNC_messageReactionAdd', onReactAdd)
  BOT.on('FUNC_messageReactionRemove', onReactRemove)
}

module.exports = {
  init
}