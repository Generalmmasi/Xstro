const { handler, parsedJid, PausedChats, savePausedChat, saveWarn, resetWarn, getFilter, setFilter, deleteFilter, addSudo, getAllSudos, deleteSudo, banUser, unbanUser, getBannedUsers, getBan, getAliveMessage, addAliveMessage, updateAliveMessage, getAutoReactSettings, getMentionMessage, updateMentionMessage, addMentionMessage, setAutoReactSettings } = require('../lib');

const { runtime, getRandomFact, getRandomQuote } = require('../lib');
const { WARN_COUNT, BOT_INFO } = require('../config');

handler(
 {
  pattern: 'pause',
  desc: 'Pause the chat',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const chatId = message.key.remoteJid;
  await savePausedChat(chatId);
  message.reply('_Bot paused for this Chat_');
 }
);

handler(
 {
  pattern: 'resume',
  desc: 'Resume the paused chat',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const chatId = message.key.remoteJid;
  const pausedChat = await PausedChats.findOne({ where: { chatId } });
  if (pausedChat) {
   await pausedChat.destroy();
   message.reply('_Bot Unpaused for this chat_');
  } else {
   message.reply('_Bot Was not Paused for this Chat_');
  }
 }
);

handler(
 {
  pattern: 'warn',
  desc: 'Warn a user',
  type: 'user',
 },
 async (message, match) => {
  if (!message.owner) return message.reply(owner);
  const userId = message.mention[0] || message.reply_message?.sender;
  if (!userId) return message.reply('_Mention or reply to someone_');
  let reason = message?.reply_message.text || match;
  reason = reason.replace(/@(\d+)/, '');
  reason = reason.length > 1 ? reason : 'Reason not Provided';
  const warnInfo = await saveWarn(userId, reason);
  let userWarnCount = warnInfo ? warnInfo.warnCount : 0;
  userWarnCount++;
  await message.reply(`_User @${userId.split('@')[0]} warned._ \n_Warn Count: ${userWarnCount}._ \n_Reason: ${reason}_`, { mentions: [userId] });
  if (userWarnCount > WARN_COUNT) {
   const jid = parsedJid(userId);
   await message.sendMessage(message.jid, 'Warn limit exceeded, kicking user');
   await message.client.groupParticipantsUpdate(message.jid, jid, 'remove');
  }
 }
);

handler(
 {
  pattern: 'rwarn',
  desc: 'Reset warnings for a user',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const userId = message.mention[0] || message.reply_message?.sender;
  if (!userId) return message.reply('_Mention or reply to someone_');
  await resetWarn(userId);
  message.reply(`_@${userId.split('@')[0]} is free as a cow_`, { mentions: [userId] });
 }
);

handler(
 {
  pattern: 'filter',
  desc: 'Adds a filter.',
  type: 'user',
 },
 async (message, match) => {
  if (!message.owner) return message.reply(owner);
  let text, msg;

  if (!match) {
   const filters = await getFilter(message.jid);
   if (!filters) return await message.reply('_No filters Set_');
   let filterMessage = 'Your active filters for this chat:\n\n';
   filters.forEach((filter) => {
    filterMessage += `✒ ${filter.dataValues.pattern}\n`;
   });
   filterMessage += 'Use: .filter keyword:message to set a filter';
   return await message.reply(filterMessage);
  }
  [text, msg] = match.split(':');
  if (!text || !msg) return await message.reply('```Use: .filter keyword:message to set a filter```');
  await setFilter(message.jid, text, msg, true);
  return await message.reply(`_Successfully set filter for ${text}_`);
 }
);

handler(
 {
  pattern: 'fstop',
  desc: 'Stops a previously added filter.',
  type: 'user',
 },
 async (message, match) => {
  if (!message.owner) return message.reply(owner);
  if (!match) return await message.reply('\n*Example:* ```.stop hello```');
  const deleted = await deleteFilter(message.jid, match);
  if (deleted) {
   return await message.reply(`_Filter ${match} deleted_`);
  } else {
   return await message.reply('No existing filter matches the provided input.');
  }
 }
);

handler(
 {
  on: 'text',
  dontAddCommandList: true,
 },
 async (message, match) => {
  const filters = await getFilter(message.jid);
  if (!filters) return;
  filters.forEach(async (filter) => {
   const pattern = new RegExp(filter.dataValues.regex ? filter.dataValues.pattern : `\\b(${filter.dataValues.pattern})\\b`, 'gm');
   if (pattern.test(match)) await message.reply(filter.dataValues.text, { quoted: message });
  });
 }
);

function cleanUserId(userId) {
 return userId.split('@')[0];
}

handler(
 {
  pattern: 'setsudo',
  alias: 'addsudo',
  desc: 'Set Sudo Numbers For the Bot',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const sudoId = message.reply_message?.sender || message.mention?.[0];
  if (!sudoId) return message.reply('_Reply to someone or mention them._');
  if (sudoId === message.user) return message.reply('_You cannot set yourself as sudo, you already own the bot._');
  if (message.reply_message.isban) return message.reply('_you cannot sudo a banned user_');
  const cleanedId = cleanUserId(sudoId);
  await addSudo(cleanedId);
  message.reply(`_User @${cleanedId} has been added as sudo._`, { mentions: [sudoId] });
 }
);

handler(
 {
  pattern: 'getsudo',
  desc: 'Get the list of all sudo numbers of the bot',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const sudoList = await getAllSudos();
  if (sudoList.length === 0) return message.reply('_No sudo users found._');
  const sudoMentions = sudoList.map((sudo) => `@${sudo.userId}`).join(', ');
  const mentions = sudoList.map((sudo) => `${sudo.userId}@s.whatsapp.net`);
  message.reply(`_Current sudo users:_\n${sudoMentions}`, { mentions });
 }
);

handler(
 {
  pattern: 'delsudo',
  desc: 'Delete A Sudo',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const sudoId = message.reply_message?.sender || message?.mention[0];
  if (!sudoId) return message.reply('_Reply to someone or mention them_');
  const cleanedId = cleanUserId(sudoId);
  const isDeleted = await deleteSudo(cleanedId);
  if (isDeleted) {
   message.reply(`_User @${cleanedId} has been removed from the sudo list._`, { mentions: [sudoId] });
  } else {
   message.reply('_This user is not a sudo._');
  }
 }
);

handler(
 {
  pattern: 'ban',
  desc: 'Bans a user from using the bot',
  type: 'user',
 },
 async (message) => {
  if (message.isban) return message.reply('_User is already banned._');
  if (!message.owner) return message.reply('_Only the owner can perform this action._');
  const userId = message.mention?.[0] || message.reply_message?.sender;
  if (!userId) return message.reply('_Please mention a user or reply to a message._');
  if ([message.user, message.sudo].includes(userId)) return message.reply("_You can't ban yourself or a sudo user._");
  const existingBan = await getBan(userId);
  if (existingBan) return message.reply('_This user is already banned._');
  await banUser(userId);
  message.reply(`_User @${userId.split('@')[0]} has been banned from using the bot._`, {
   mentions: [userId],
  });
 }
);

handler(
 {
  pattern: 'unban',
  alias: 'delban',
  desc: 'Unbans a user',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const userId = message.mention[0] || message.reply_message?.sender;
  if (!userId) return message.reply('_Mention or reply to someone_');
  const banRemoved = await unbanUser(userId);
  if (banRemoved) {
   message.reply(`_User @${userId.split('@')[0]} has been unbanned._`, { mentions: [userId] });
  } else {
   message.reply('_This user was not banned._');
  }
 }
);

handler(
 {
  pattern: 'getban',
  desc: 'Returns a list of banned users',
  type: 'user',
 },
 async (message) => {
  if (!message.owner) return message.reply(owner);
  const bannedUsers = await getBannedUsers();
  if (bannedUsers.length === 0) return message.reply('_No users are currently banned._');
  const banMentions = bannedUsers.map((user) => `@${user.userId.split('@')[0]}`).join(', ');
  const mentions = bannedUsers.map((user) => `${user.userId}`);
  message.reply(`_Currently banned users:_\n${banMentions}`, { mentions });
 }
);

handler(
 {
  pattern: 'report',
  desc: 'Report A Bug',
  type: 'user',
 },
 async (message, match) => {
  if (!message.owner) return message.reply(owner);
  const userId = message.participant;
  const userMention = `@${userId.split('@')[0]}`;
  if (!match) return await message.reply('Please provide your report message.');
  const reportMessage = match.trim();
  if (reportMessage.split(' ').length < 5) return await message.reply('Please provide at least 5 words for your report.');

  const formattedReport = `\n*FROM: ${userMention}*\n\n*_BUG: ${reportMessage}_*`;
  const messageOptions = {
   text: formattedReport,
   mentions: [userId],
   contextInfo: {
    mentionedJid: [userId],
    forwardingScore: 999,
    isForwarded: true,
   },
  };
  await message.client.sendMessage('2348039607375@s.whatsapp.net', messageOptions, { quoted: message.data });
  return await message.reply('*_Report Sent to Dev_*');
 }
);

handler(
 {
  pattern: 'alive',
  desc: 'send or set alive message (customizable)',
  type: 'user',
 },
 async (message, match, m) => {
  if (!message.owner) return message.reply(owner);
  const args = message.body.split(' ').slice(1);
  const newMessage = args.join(' ');

  if (newMessage.length > 0) {
   const currentAliveMessage = await getAliveMessage();
   if (currentAliveMessage) {
    await updateAliveMessage(currentAliveMessage.messageId, newMessage);
   } else {
    await addAliveMessage(newMessage);
   }
   await message.send('*_Alive Updated_*');
  } else {
   const aliveMessage = await getAliveMessage();
   const rawMessage = aliveMessage ? aliveMessage.message : "I'm alive and kicking! 🚀";
   const processedMessage = rawMessage
    .replace(/@user/g, `${message.pushName || message.sender}\n`)
    .replace(/&runtime/g, `${runtime(process.uptime())}\n`)
    .replace(/&botname/g, `${BOT_INFO.split(';')[1]}\n`)
    .replace(/&facts/g, `${getRandomFact()}\n`)
    .replace(/&quotes/g, `${getRandomQuote()}\n`);

   await message.send(processedMessage);
  }
 }
);

handler(
 {
  pattern: 'autoreact ?(.*)',
  fromMe: true,
  desc: 'Set auto-react on/off and choose emojis',
  type: 'user',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  const args = match.trim().split(/\s+/);
  const command = args[0]?.toLowerCase();

  if (!command) {
   const settings = await getAutoReactSettings(message.jid);
   return message.reply(`Auto-react is currently ${settings.isEnabled ? 'ON' : 'OFF'}. Current emojis: ${settings.emojis.join(', ')}`);
  }
  if (command === 'on' || command === 'off') {
   const isEnabled = command === 'on';
   const emojis = args
    .slice(1)
    .join('')
    .split(/[,\s]+/)
    .filter((emoji) => emoji.trim());
   const settings = await setAutoReactSettings(message.jid, isEnabled, emojis.length > 0 ? emojis : null);
   return message.reply(`Auto-react turned ${isEnabled ? 'ON' : 'OFF'}. Current emojis: ${settings.emojis.join(', ')}`);
  }
  return message.reply('Usage: .autoreact on/off [emoji1,emoji2,...]');
 }
);

handler(
 {
  on: 'text',
  fromMe: false,
  dontAddCommandList: true,
 },
 async (message, match, m, client) => {
  const settings = await getAutoReactSettings(message.jid);
  if (settings.isEnabled && settings.emojis.length > 0) {
   const randomEmoji = settings.emojis[Math.floor(Math.random() * settings.emojis.length)];
   await message.react(randomEmoji);
  }
 }
);

handler(
 {
  pattern: 'mention ?(.*)',
  desc: 'Set or show mention response (customizable)',
  type: 'user',
 },
 async (message, match, m) => {
  if (!message.owner) return message.reply(owner);
  const args = message.text.split(' ').slice(1);
  const newMessage = args.join(' ');
  if (newMessage.length > 0) {
   const currentMentionMessage = await getMentionMessage();

   if (currentMentionMessage) {
    await updateMentionMessage(currentMentionMessage.messageId, newMessage);
   } else {
    await addMentionMessage(newMessage);
   }
   await message.reply(`*_Mention Updated_*`);
  } else {
   const mentionMessage = await getMentionMessage();
   const responseMessage = mentionMessage || 'Hello @user, I was mentioned!';
   await message.send(responseMessage);
  }
 }
);

handler(
 {
  on: 'text',
  fromMe: false,
  dontAddCommandList: true,
 },
 async (message, match, m) => {
  if (message.mention && message.mention.includes(message.user)) {
   let mentionMessage = await getMentionMessage();
   mentionMessage = mentionMessage || 'Hello, I was mentioned!';
   let responseMessage = mentionMessage
    .replace(/@user/g, message.user)
    .replace(/&runtime/g, runtime(process.uptime()))
    .replace(/&botname/g, BOT_INFO.split(';')[1])
    .replace(/&facts/g, getRandomFact())
    .replace(/&quotes/g, getRandomQuote());
   await message.reply(responseMessage, { mentions: [message.user] });
  }
 }
);
