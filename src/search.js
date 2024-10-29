const { tiny, getFloor, Google, onwhatsapp } = require('xstro');
const { handler, getJson, getRandomFact, getRandomQuote, fetchJoke } = require('../lib');
const moment = require('moment');

handler(
 {
  pattern: 'define',
  desc: 'Get definition of word from dictionary',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide a word_');
  const msg = await message.reply('🔍_Searching Meaning_');
  const res = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${match}`);
  const { word, phonetic, phonetics, meanings } = res[0];
  let response = `*Word:* ${word}\n*Phonetic:* ${phonetic || 'N/A'}\n\n`;

  meanings.forEach(({ partOfSpeech, definitions }) => {
   response += `*Part of Speech:* ${partOfSpeech}\n`;
   definitions.forEach(({ definition, synonyms, antonyms, example }) => {
    response += `*Definition:* ${definition}\n` + (synonyms.length ? `*Synonyms:* ${synonyms.join(', ')}\n` : '') + (antonyms.length ? `*Antonyms:* ${antonyms.join(', ')}\n` : '') + (example ? `*Example:* ${example}\n` : '') + '---\n';
   });
  });
  await msg.edit(response);
  return await message.send(phonetics[0].audio);
 }
);

handler(
 {
  pattern: 'github',
  desc: 'Search for a GitHub user and return their details',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide GitHub username_');
  const msg = await message.reply('🔍_Searching GitHub User_');
  const res = await getJson(`https://api.github.com/users/${match}`);
  const { login, bio, public_repos, followers, following } = res;
  const response = `*Username:* ${login}\n\n` + `*Bio:* ${bio || 'N/A'}\n\n*Public Repos:* ${public_repos}\n\n` + `*Followers:* ${followers}\n\n*Following:* ${following}`;
  await msg.edit(tiny(response));
 }
);

handler(
 {
  pattern: 'time ?(.*)',
  desc: 'Find Time',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return await message.reply('Need a place name to know time. Example: .time japan');
  const location = match.toLowerCase();
  const data = await getJson(`https://ironman.koyeb.app/ironman/search/time?loc=${location}`);
  if (data.error === 'no place') return await message.send('No place found');
  const { name, state, tz, capital, currCode, currName, phone } = data;
  const now = new Date();
  const options = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const time12 = new Intl.DateTimeFormat('en-US', { ...options, hour12: true }).format(now);
  const time24 = new Intl.DateTimeFormat('en-US', { ...options, hour12: false }).format(now);
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  const msg = `Current time:\n(12-hour): ${time12}:${milliseconds}\n(24-hour): ${time24}:${milliseconds}\nLocation: ${name}\n` + (state ? `State: ${state}\n` : '') + `Capital: ${capital}\nCurrency: ${currName} (${currCode})\nPhone code: +${phone}`;

  await message.reply(tiny(msg));
 }
);

handler(
 {
  pattern: 'weather ?(.*)',
  desc: 'weather info',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return await message.send('*Example : weather delhi*');
  const data = await getJson(`http://api.openweathermap.org/data/2.5/weather?q=${match}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`).catch(() => {});
  if (!data) return await message.send(`_${match} not found_`);
  const { name, timezone, sys, main, weather, visibility, wind } = data;
  const degree = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][getFloor(wind.deg / 22.5 + 0.5) % 16];
  return await message.send(tiny(`*Name :* ${name}\n*Country :* ${sys.country}\n*Weather :* ${weather[0].description}\n*Temp :* ${getFloor(main.temp)}°\n*Feels Like :* ${getFloor(main.feels_like)}°\n*Humidity :* ${main.humidity}%\n*Visibility  :* ${visibility}m\n*Wind* : ${wind.speed}m/s ${degree}\n*Sunrise :* ${moment.utc(sys.sunrise, 'X').add(timezone, 'seconds').format('hh:mm a')}\n*Sunset :* ${moment.utc(sys.sunset, 'X').add(timezone, 'seconds').format('hh:mm a')}`));
 }
);

handler(
 {
  pattern: 'wallpaper',
  desc: 'Search wallpaper',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide query_');
  const res = await getJson(`https://api.giftedtech.my.id/api/search/wallpaper?apikey=astro_fx-k56DdhdS7@gifted_api&query=${match}`);
  if (!res || !res.results || res.results.length === 0) return message.reply('_no results found_');
  const sentSuffixes = new Set();
  for (const wallpaper of res.results) {
   for (const image of wallpaper.image) {
    const suffixMatch = image.match(/_(w\d+)\.webp$/);
    const suffix = suffixMatch ? suffixMatch[1] : null;

    if (suffix && !sentSuffixes.has(suffix)) {
     sentSuffixes.add(suffix);
     await message.send(image);
    }
   }
  }
 }
);

handler(
 {
  pattern: 'google',
  desc: 'perform google search',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide query_');
  const msg = await message.reply('_Searching for ' + match + '_');
  const res = await Google(match);
  return await msg.edit(res);
 }
);

handler(
 {
  pattern: 'lyrics',
  desc: 'Perform lyrics search',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide query_');
  const msg = await message.reply('_Searching for ' + match + '_');
  const res = await getJson(`https://api.giftedtech.my.id/api/search/lyrics?apikey=astro_fx-k56DdhdS7@gifted_api&query=${match}`);
  const { Artist, Title, Lyrics } = res.result;
  const result = `🎶 *${Title}* by *${Artist}*\n\n${Lyrics}`;
  return await msg.edit(tiny(result));
 }
);

handler(
 {
  pattern: 'fact',
  desc: 'Get Joke',
  type: 'search',
 },
 async (message) => {
  return await message.send(getRandomFact());
 }
);

handler(
 {
  pattern: 'quotes',
  desc: 'Get Joke',
  type: 'search',
 },
 async (message) => {
  return await message.send(getRandomQuote());
 }
);

handler(
 {
  pattern: 'joke',
  desc: 'Get Joke',
  type: 'search',
 },
 async (message) => {
  const joke = await fetchJoke();
  return await message.send(joke);
 }
);

handler(
 {
  pattern: 'onwa',
  desc: 'check if a number is on whatsapp',
  type: 'search',
 },
 async (message, match) => {
  if (!match) return message.reply('_provide a number without +_');
  const msg = await message.reply('_checking numbers_');
  const res = await onwhatsapp(match);
  await msg.edit(res);
 }
);
