const { handler, flipMedia } = require('../lib');
const { STICKER_PACK } = require('../config');
const { fancy } = require('xstro');

handler(
 {
  pattern: 'sticker ?(.*)',
  desc: 'Converts Image/Video to Sticker',
  type: 'converter',
 },
 async (message, match) => {
  if (!message.mode) return;
  if (message.isban) return message.reply(ban);
  const hasMedia = message.reply_message?.image || message.reply_message?.video;
  if (!hasMedia) return message.reply('_Reply an Image/Video_');
  const content = await message.download(message.quoted?.message);
  return message.send(content.buffer, {
   type: 'sticker',
   author: STICKER_PACK.split(';')[0],
   packname: STICKER_PACK.split(';')[1],
  });
 }
);

handler(
 {
  pattern: 'take ?(.*)',
  desc: 'Saves Stickers to be Yours',
  type: 'converter',
 },
 async (message, match) => {
  if (!message.mode) return;
  if (message.isban) return message.reply(ban);
  const isStickerMedia = message.reply_message?.sticker;
  if (!isStickerMedia) return message.reply('_Reply A Sticker!_');
  const newSticker = await message.download(message.quoted?.message);
  return message.send(newSticker.buffer, {
   type: 'sticker',
   author: STICKER_PACK.split(';')[0],
   packname: STICKER_PACK.split(';')[1],
  });
 }
);

handler(
 {
  pattern: 'img',
  desc: 'Converts Sticker/Video to Images',
  type: 'converter',
 },
 async (message) => {
  if (!message.mode) return;
  if (message.isban) return message.reply(ban);
  const res = message.reply_message?.video;
  if (!res) return message.reply('_Reply to a Sticker_');
  const contentBuffer = await message.download(message.quoted?.message);
  return await message.send(contentBuffer.buffer, { type: 'image' });
 }
);

handler(
 {
  pattern: 'mp3',
  desc: 'Converts Video to Mp3 Audio',
  type: 'converter',
 },
 async (message) => {
  if (!message.mode) return;
  if (message.isban) return message.reply(ban);
  if (!message.reply_message?.video) return message.reply('_Reply Video Only!_');
  const res = await message.download(message.quoted?.message);
  return message.send(res.buffer, { type: 'audio' });
 }
);

handler(
 {
  pattern: 'fancy',
  alias: 'styly',
  desc: 'Convert Normal text to fancy',
  type: 'converter',
 },
 async (message, match) => {
  if (!message.mode) return;
  if (message.isban) return message.reply(ban);
  match = match || message.reply_message?.text;
  if (!match) return message.reply('_Provide text or reply text message!_');
  const res = await fancy(match);
  return message.reply(res);
 }
);

handler(
 {
  pattern: 'rotate',
  desc: 'Rotate Image/Video to different direction',
  type: 'converter',
 },
 async (message, match) => {
  if (!message.mode || message.isban) return message.reply(message.isban ? ban : '_mode is not enabled!_');
  if (!message.reply_message?.image && !message.reply_message?.video) return message.reply('_reply with an image or video only!_');
  if (!['left', 'right', 'vertical', 'horizontal'].includes(match)) return message.reply('_invalid option!_\n' + message.prefix + 'rotate [`left`, `right`, `vertical`, `horizontal`]');
  const buff = await message.download(message.quoted.message);
  const res = await flipMedia(buff.buffer, match);
  if (!res) return message.reply('_rotation failed, try again!_');
  return message.send(res);
 }
);
