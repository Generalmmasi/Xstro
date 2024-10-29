const { twitter, isUrl } = require('xstro');
const { handler, getJson } = require('../lib');

const BASE_URL = 'https://api.giftedtech.my.id/api/download';
const API_KEY = 'astro_fx-k56DdhdS7@gifted_api';

const getMedia = async (message, match, endpoint, downloadMsg = '_Downloading!_', customValidator) => {
 const targetUrl = match || message.reply_message?.text;
 if (customValidator && !isUrl(targetUrl)) return message.reply('_Invalid URL!_');
 await message.reply(downloadMsg);
 const res = await getJson(`${BASE_URL}/${endpoint}?apikey=${API_KEY}&url=${encodeURIComponent(targetUrl)}`);
 return res;
};

handler(
 {
  pattern: 'twitter ?(.*)',
  desc: 'downloads x videos',
  type: 'download',
 },
 async (message, match) => {
  if (!match || !match.includes('x.com')) return message.reply('_Not a valid Twitter URL!_');
  const res = await twitter(match || message.reply_message?.text);
  return await message.send(res);
 }
);

handler(
 {
  pattern: 'drive',
  desc: 'downloads documents from Google Drive URL',
  type: 'download',
 },
 async (message, match) => {
  const res = await getMedia(message, match, 'gdrivedl', '_Downloading file_', (url) => url.includes('drive.google.com'));
  return await message.send(res.result.download);
 }
);

handler(
 {
  pattern: 'tiktok',
  desc: 'downloads TikTok videos',
  type: 'download',
 },
 async (message, match) => {
  const res = await getMedia(message, match, 'tiktokdlv1', '_Downloading!_', (url) => url.includes('tiktok.com'));
  const { title, created_at, video } = res.result;
  return await message.send(video.noWatermark, { caption: `${title}\n${created_at}` });
 }
);

handler(
 {
  pattern: 'spotify',
  desc: 'downloads Spotify music',
  type: 'download',
 },
 async (message, match) => {
  const res = await getMedia(message, match, 'spotifydl', '_Downloading_', (url) => url.includes('open.spotify.com'));
  await message.reply('_Downloading ' + res.result.data.title + '_');
  return await message.send(res.result.data.preview);
 }
);

handler(
 {
  pattern: 'ytmp4',
  desc: 'download YouTube video mp4',
  type: 'download',
 },
 async (message, match) => {
  const res = await getMedia(message, match, 'ytmp4');
  return await message.send(res.result.download_url, { caption: res.result.title });
 }
);

handler(
 {
  pattern: 'ytmp3',
  desc: 'download YouTube videos mp3',
  type: 'download',
 },
 async (message, match) => {
  const res = await getMedia(message, match, 'mp3');
  return await message.send(res.result.download['.m4a'].download_url, { type: 'audio' });
 }
);

handler(
 {
  pattern: 'pinterest',
  desc: 'Get Pinterest Images',
  type: 'download',
 },
 async (message, match) => {
  if (!match) return message.reply('_Provide a query_');
  const res = await getJson(`https://ironman.koyeb.app/ironman/search/pinterest?q=${encodeURIComponent(match)}`);
  const uniqueImages = [...new Set(res)].slice(1);
  for (const image of uniqueImages) {
   await message.send(image);
  }
 }
);
