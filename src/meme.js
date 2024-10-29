const { tiny } = require('xstro');
const path = require('path');
const { handler, addTextToTweet } = require('../lib');

handler(
 {
  pattern: 'elon',
  desc: 'Create Fake Elonmusk tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'elonmusk.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);

handler(
 {
  pattern: 'trump',
  desc: 'Create Fake Trump tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'trump.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);

handler(
 {
  pattern: 'ronaldo',
  desc: 'Create Fake Ronaldo tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'ronaldo.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);

handler(
 {
  pattern: 'messi',
  desc: 'Create Fake Messi Team tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'messi.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);

handler(
 {
  pattern: 'obama',
  desc: 'Create Fake Obama tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'obama.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);

handler(
 {
  pattern: 'tate',
  desc: 'Create Fake Andrew tate tweet',
  type: 'meme',
 },
 async (message, match) => {
  if (!message.owner) return message.reply(owner);
  if (!match) return message.reply('_provide text_');
  const buff = await addTextToTweet(match, path.join(__dirname, '..', 'media', 'image', 'andrew.png'));
  const { buffer } = buff;
  return await message.send(buffer, { caption: tiny('created by xstro') });
 }
);
