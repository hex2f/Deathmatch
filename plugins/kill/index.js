let BOT

const kill = async (message) => {
  if (!message.guild) { return }
  let killerRole = await BOT.database.getServerData(message.guild.id, 'role_killer')
  let deadRole = await BOT.database.getServerData(message.guild.id, 'role_dead')
  let playerRole = await BOT.database.getServerData(message.guild.id, 'role_player')
  let immunityRole = await BOT.database.getServerData(message.guild.id, 'role_immunity')
  if (!killerRole || !deadRole || !playerRole) {
    return
  }

  let toKill = message.mentions.users.array()[0]
  if (!toKill) {
    BOT.send(message.author, {
      title: 'Kill Usage Error',
      description: `You need to mention someone in your kill command ya dumbom.`,
      color: BOT.colors.red
    })
    message.delete()
    return
  }
  toKill = await message.guild.members.get(toKill.id)
  console.log('toKill', toKill.id)
  if (!toKill) { try { toKill = await message.guild.fetchMember(message.mentions.users.array()[0]) } catch(e) {console.log(e)} }
  let error
  console.log('toKill', toKill.id)

  if (message.member._roles.indexOf(killerRole) === -1) {
    error = `You're not a Murderer, are you?`
    BOT.send(message.author, {
      title: 'Kill Usage Error',
      description: error,
      color: BOT.colors.red
    })
    message.delete()
    return
  }
  if (toKill._roles.indexOf(deadRole) > -1) {
    error = `${toKill.user.username}#${toKill.user.discriminator} is already dead.`
    BOT.send(message.author, {
      title: 'Kill Usage Error',
      description: error,
      color: BOT.colors.red
    })
    message.delete()
    return
  }
  if (toKill._roles.indexOf(killerRole) > -1 || toKill._roles.indexOf(immunityRole) > -1) {
    if (toKill.user.id !== message.member.user.id) {
      error = `${toKill.user.username}#${toKill.user.discriminator} has kill immunity.`
      BOT.send(message.author, {
        title: 'Kill Usage Error',
        description: error,
        color: BOT.colors.red
      })
      message.delete()
      return
    }
  }
  if (toKill._roles.indexOf(playerRole) === -1) {
    if (toKill.user.id !== message.member.user.id) {
      error = `${toKill.user.username}#${toKill.user.discriminator} is not a player.`
      BOT.send(message.author, {
        title: 'Kill Usage Error',
        description: error,
        color: BOT.colors.red
      })
      message.delete()
      return
    }
  }

  toKill.setRoles([deadRole])
  if (toKill.user.id !== message.member.user.id) {
    message.member.setRoles([playerRole, immunityRole])
  }
  try {
    BOT.send(message.author, {
      title: `Killed ${toKill.user.username}`,
      description: `You killed ${toKill.user.username}#${toKill.user.discriminator} 🔫\nYou've gained temporary immunity until the next draw is 
closed.`,
      color: BOT.colors.blue
    })

    BOT.send(toKill, {
      title: `You died.`,
      description: `Someone shot ya in the back o the neck.\nDon't loose hope though, you can still be revived by entering the revival pick!`,
      color: BOT.colors.gray
    })
  } catch(e) { console.log(e)}

  message.delete()
}

const init = (bot) => {
  BOT = bot

  BOT.register('!kill', kill)
}

module.exports = {
  init
}
