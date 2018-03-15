let BOT

const ban = async (message) => {
  if (!message.guild) { return }
  if (await BOT.isOp(message) === false) { return }

  let toBan = message.mentions.users.array()[0]
  let reason = message.content.split(' ').slice(2).join(' ')

  if (!toBan || !reason) {
    BOT.send(message.channel, {
      title: 'Usage Error',
      description: `Usage: !ban <@user> <Some Message>`,
      color: BOT.colors.red
    })
    BOT.denied(message)
    return
  }

  toBan = await message.guild.members.get(toBan.id)

  try {
    BOT.send(toBan, {
      title: 'You have been banned',
      description: `Reason: ${reason}`,
      color: BOT.colors.red
    })
    toBan.ban({
      days: 1,
      reason: reason
    })
  } catch (e) {}

  BOT.success(message)
}

const init = (bot) => {
  BOT = bot

  BOT.register('!ban', ban)
}

module.exports = {
  init
}