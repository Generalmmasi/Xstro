const { handler, getJson } = require('../lib');
const fs = require('fs');
const path = require('path');
const { upload, isUrl, ssweb } = require('xstro');

handler(
 {
  pattern: 'temp',
  desc: 'Clean temp folder',
  type: 'tools',
 },
 async (message) => {
  const tempPath = path.join(__dirname, '..', 'temp');
  const calculateFolderSize = (folderPath) => fs.readdirSync(folderPath).reduce((total, file) => total + fs.statSync(path.join(folderPath, file)).size, 0);
  const clearFiles = (folderPath) => fs.readdirSync(folderPath).forEach((file) => fs.unlinkSync(path.join(folderPath, file)));
  const sizeBeforeClear = calculateFolderSize(tempPath);
  clearFiles(tempPath);
  return await message.reply(`_Cache cleared with ${sizeBeforeClear} bytes._`);
 }
);

handler(
 {
  pattern: 'upload',
  alias: 'url',
  desc: 'Get Url of an object',
  type: 'tools',
 },
 async (message) => {
  if (!message.reply_message?.image && !message.reply_message?.video && !message.reply_message?.audio) return message.reply('_Reply Image/Video/Audio_');
  const media = await message.download(message.quoted?.message);
  const res = await upload(media.buffer);
  return await message.reply(res);
 }
);

handler(
 {
  pattern: 'ssweb',
  desc: 'ScreenShot A Website',
  type: 'tools',
 },
 async (message, match) => {
  if (!match) return message.reply('_Provide Url_');
  if (!isUrl(match)) return message.reply('_Invaild Url_');
  const res = await ssweb(match);
  return await message.send(res);
 }
);

handler(
 {
  pattern: 'fetch',
  desc: 'Get Data From An Api',
  type: 'tools',
 },
 async (message, match) => {
  if (!isUrl(match)) return message.reply('_provide url_');
  const res = await getJson(match);
  return await message.reply(res);
 }
);
