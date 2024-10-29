const { enhanceImage, tiny, getBuffer } = require('xstro');
const { handler, getJson } = require('../lib');

handler(
 {
  pattern: 'upscale',
  alias: 'enhance',
  desc: 'enchnace image quality',
  type: 'ai',
 },
 async (message) => {
  if (!message.reply_message?.image) return message.reply('_Reply An Image_');
  const req = await message.download();
  const res = await enhanceImage(req.buffer, 'enhance');
  return await message.send(res);
 }
);

handler(
 {
  pattern: 'recolor',
  desc: 'Recolors Dead Images',
  type: 'ai',
 },
 async (message) => {
  if (!message.reply_message?.image) return message.reply('_Reply An Image_');
  const req = await message.download();
  const res = await enhanceImage(req.buffer, 'recolor');
  return await message.send(res);
 }
);

handler(
 {
  pattern: 'dehaze',
  desc: 'Add dehaze effect to an image',
  type: 'ai',
 },
 async (message) => {
  if (!message.reply_message?.image) return message.reply('_Reply An Image_');
  const req = await message.download();
  const res = await enhanceImage(req.buffer, 'dehaze');
  return await message.send(res);
 }
);

handler(
 {
  pattern: 'gemini',
  alias: 'bard',
  desc: 'Chat with Google Gemini Ai',
  type: 'ai',
 },
 async (message, match) => {
  const { sender, prefix } = message;
  if (!match) return message.reply('_Hi ' + sender + '_\n\n_' + prefix + 'Gemini What is life_');
  const msg = await message.reply('_Thinking 🤔_');
  const res = await getJson(`https://api.giftedtech.my.id/api/ai/geminiai?apikey=astro_fx-k56DdhdS7@gifted_api&q=${encodeURIComponent(match)}`);
  return await msg.edit(res.result);
 }
);

handler(
 {
  pattern: 'gpt4',
  alias: 'gpt',
  desc: 'Query OpenAi Gpt4 Model',
  type: 'ai',
 },
 async (message, match) => {
  const { sender, prefix } = message;
  if (!match) return message.reply('_Hi ' + sender + '_\n\n_' + prefix + 'gpt4 Which Ai Model are you_');
  const msg = await message.reply('_Deep thought ✍️_');
  const res = await getJson(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=astro_fx-k56DdhdS7@gifted_api&q=${encodeURIComponent(match)}`);
  return msg.edit(res.result);
 }
);

handler(
 {
  pattern: 'sd',
  desc: 'Generate Images from text',
  type: 'ai',
 },
 async (message, match) => {
  const { sender, prefix } = message;
  if (!match) return message.reply('_Hi ' + sender + '_\n\n_' + prefix + 'sd an image of ironman with batman_');
  const res = await getBuffer(`https://api.giftedtech.my.id/api/ai/sd?apikey=astro_fx-k56DdhdS7@gifted_api&prompt=${encodeURIComponent(match)}`);
  return await message.send(res, { contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363347500446894@newsletter', newsletterName: tiny(`stable diff`) } } });
 }
);
