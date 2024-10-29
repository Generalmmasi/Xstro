const { generateWAMessageFromContent } = require('baileys');
const { handler, serialize, loadMessage, parsedJid } = require('../lib');

handler(
 {
  pattern: 'vv ?(.*)',
  desc: 'Downloads ViewOnce Messages',
  type: 'whatsapp',
 },
 async (message) => {
  try {
   if (!message.owner) return message.reply(owner);
   if (!message.reply_message) return message.reply('_Reply A ViewOnce Message!_');
   const content = await message.download(message.quoted?.message);
   await message.send(content.buffer, { jid: message.participant });
   return message.reply('_Saved, Check your Dm Sir_');
  } catch {
   return message.reply('_Not A ViewOnce Sir_');
  }
 }
);

handler(
 {
  pattern: 'setpp ?(.*)',
  desc: 'change WhatsApp profile Picture',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!message.reply_message?.image) return message.reply('_Reply An Image_');
  let imgpath = await message.download(message.reply_message.messageInfo);
  return await client.updateProfilePicture(message.user, { url: imgpath.filePath });
 }
);

handler(
 {
  pattern: 'setname',
  desc: 'Set User name',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!match) return message.reply('_Provide Name!_');
  const newName = match;
  await client.updateProfileName(newName);
  return await message.reply(`_Name Set to ${newName}_`);
 }
);

handler(
 {
  pattern: 'block',
  desc: 'Block a person',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  let jid;
  if (message.isGroup) {
   jid = message.mention && message.mention.length > 0 ? message.mention[0] : message.reply_message ? message.reply_message.jid : null;
   if (!jid) return await message.reply('_Please mention or reply to the person you want to block._');
   await client.updateBlockStatus(jid, 'block');
   return await message.reply(`_@${jid.split('@')[0]} Blocked_`, { mentions: [jid] });
  } else {
   jid = message.jid;
   await message.reply('_Blocked_');
   return await client.updateBlockStatus(jid, 'block');
  }
 }
);

handler(
 {
  pattern: 'unblock',
  desc: 'Unblocks a person',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  let jid;
  if (message.isGroup) {
   jid = message.mention && message.mention.length > 0 ? message.mention[0] : message.reply_message ? message.reply_message.jid : null;
   if (!jid) return await message.reply('_Please mention or reply to the person you want to Unblock._');
   await client.updateBlockStatus(jid, 'unblock');
   return await message.reply(`_@${jid.split('@')[0]} UnBlocked_`, { mentions: [jid] });
  } else {
   jid = message.jid;
   await client.updateBlockStatus(jid, 'unblock');
   return await message.reply('_Unblocked_');
  }
 }
);

handler(
 {
  pattern: 'jid',
  desc: 'Give jid of chat/user',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  const targetJid = message.reply_message?.jid || message.jid || message.mention[0];
  return await message.send(targetJid);
 }
);

handler(
 {
  pattern: 'dlt',
  desc: 'Deletes your message or a replied message',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!message.reply_message) return message.reply('_Reply Msg_');
  await client.sendMessage(message.jid, { delete: message.reply_message.key || m.quoted.key });
 }
);

handler(
 {
  pattern: 'edit ?(.*)',
  desc: 'Edit message sent by the command',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!message.reply_message) return await message.reply('_Please reply to a message._');
  const newText = match;
  return await client.sendMessage(message.jid, { text: newText, edit: m.quoted.key });
 }
);

handler(
 {
  pattern: 'quoted',
  desc: 'quoted message',
  type: 'whatsapp',
 },
 async (message) => {
  if (!message.owner || !message.reply_message) return await message.reply(!message.owner ? owner : '*Reply to a message*');
  let msg = await loadMessage(message.reply_message.key.id);
  if (!msg) return await message.reply('_Message not found_');
  msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
  if (!msg.quoted) return await message.reply('No quoted message found');
  const quotedText = async (jid, quotedMsg, options = {}) => {
   const generatedMsg = generateWAMessageFromContent(jid, quotedMsg, { ...options, userJid: message.client.user.id });
   await message.client.relayMessage(jid, generatedMsg.message, { messageId: generatedMsg.key.id, ...options });
  };
  await quotedText(message.jid, msg.quoted.message);
 }
);

handler(
 {
  pattern: 'clear ?(.*)',
  desc: 'delete whatsapp chat',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await client.chatModify({ delete: true, lastMessages: [{ key: message.data.key, messageTimestamp: message.timestamp }] }, message.jid);
  await message.reply('_Cleared.._');
 }
);

handler(
 {
  pattern: 'archive ?(.*)',
  desc: 'archive whatsapp chat',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await client.chatModify({ archive: true, lastMessages: [{ message: message.message, key: message.key, messageTimestamp: message.timestamp }] }, message.jid);
  return message.reply('_Archived.._');
 }
);

handler(
 {
  pattern: 'unarchive ?(.*)',
  desc: 'unarchive whatsapp chat',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await client.chatModify({ archive: false, lastMessages: [{ message: message.message, key: message.key, messageTimestamp: message.timestamp }] }, message.jid);
  return message.reply('_Unarchived.._');
 }
);

handler(
 {
  pattern: 'pin',
  desc: 'pin a chat',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await client.chatModify({ pin: true }, message.jid);
  return message.reply('_Pined.._');
 }
);

handler(
 {
  pattern: 'unpin ?(.*)',
  desc: 'unpin a msg',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await client.chatModify({ pin: false }, message.jid);
  return message.reply('_Unpined.._');
 }
);

handler(
 {
  pattern: 'forward ?(.*)',
  desc: 'Forwards the replied message (any type) with quote',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!m.quoted) return await message.reply('Reply to a message to forward');
  const quotedMessage = message?.quoted;
  const jids = parsedJid(match);
  for (const jid of jids) await client.sendMessage(jid, { forward: quotedMessage, contextInfo: { forwardingScore: 999, isForwarded: true } }, { quoted: message?.quoted });
  return message.reply('*_Forwarded_*');
 }
);

handler(
 {
  pattern: 'save ?(.*)',
  desc: 'Saves WhatsApp Status',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!m.quoted) return await message.reply('_Reply to a status message_');
  const quotedMessage = message?.quoted;
  await client.sendMessage(message.user, { forward: quotedMessage }, { quoted: message?.quoted });
 }
);

handler(
 {
  pattern: 'logout',
  desc: 'Logout of bot',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  await message.reply('_logged Out_');
  return client.logout();
 }
);
