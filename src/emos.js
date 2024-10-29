const { handler } = require('../lib');

const { heartDesign, weatherDesign, gemDesign, treeDesign, musicDesign, sportDesign, toolDesign, holidayDesign, dessertDesign, travelDesign, spaceDesign, fashionDesign, beverageDesign, instrumentDesign, gameDesign, emojiArtDesign, partyDesign, holidaySeasonDesign, fitnessDesign, technologyDesign, animalEmojiDesign, kissDesign, hugDesign, slapDesign, callConversation } = require('../lib');

handler(
 {
  pattern: 'emoi',
  desc: 'Heart emois',
  type: 'emois',
 },
 async (message) => {
  await heartDesign(message);
 }
);
handler(
 {
  pattern: 'emoi1',
  desc: 'Weather emois',
  type: 'emois',
 },
 async (message) => {
  await weatherDesign(message);
 }
);

handler(
 {
  pattern: 'emoi2',
  desc: 'Gem emois',
  type: 'emois',
 },
 async (message) => {
  await gemDesign(message);
 }
);

handler(
 {
  pattern: 'emoi3',
  desc: 'Tree emois',
  type: 'emois',
 },
 async (message) => {
  await treeDesign(message);
 }
);

handler(
 {
  pattern: 'emoi4',
  desc: 'Music emois',
  type: 'emois',
 },
 async (message) => {
  await musicDesign(message);
 }
);

handler(
 {
  pattern: 'emoi5',
  desc: 'Sport emois',
  type: 'emois',
 },
 async (message) => {
  await sportDesign(message);
 }
);

handler(
 {
  pattern: 'emoi6',
  desc: 'Tool emois',
  type: 'emois',
 },
 async (message) => {
  await toolDesign(message);
 }
);

handler(
 {
  pattern: 'emoi7',
  desc: 'Holiday emois',
  type: 'emois',
 },
 async (message) => {
  await holidayDesign(message);
 }
);

handler(
 {
  pattern: 'emoi8',
  desc: 'Dessert emois',
  type: 'emois',
 },
 async (message) => {
  await dessertDesign(message);
 }
);

handler(
 {
  pattern: 'emoi9',
  desc: 'Travel emois',
  type: 'emois',
 },
 async (message) => {
  await travelDesign(message);
 }
);

handler(
 {
  pattern: 'emoi10',
  desc: 'Space emois',
  type: 'emois',
 },
 async (message) => {
  await spaceDesign(message);
 }
);

handler(
 {
  pattern: 'emoi11',
  desc: 'Fashion emois',
  type: 'emois',
 },
 async (message) => {
  await fashionDesign(message);
 }
);

handler(
 {
  pattern: 'emoi12',
  desc: 'Beverage emois',
  type: 'emois',
 },
 async (message) => {
  await beverageDesign(message);
 }
);

handler(
 {
  pattern: 'emoi13',
  desc: 'Instrument emois',
  type: 'emois',
 },
 async (message) => {
  await instrumentDesign(message);
 }
);

handler(
 {
  pattern: 'emoi14',
  desc: 'Game emois',
  type: 'emois',
 },
 async (message) => {
  await gameDesign(message);
 }
);

handler(
 {
  pattern: 'emoi15',
  desc: 'Emoji Art emois',
  type: 'emois',
 },
 async (message) => {
  await emojiArtDesign(message);
 }
);

handler(
 {
  pattern: 'emoi16',
  desc: 'Party emois',
  type: 'emois',
 },
 async (message) => {
  await partyDesign(message);
 }
);

handler(
 {
  pattern: 'emoi17',
  desc: 'Holiday Season emois',
  type: 'emois',
 },
 async (message) => {
  await holidaySeasonDesign(message);
 }
);

handler(
 {
  pattern: 'emoi18',
  desc: 'Fitness emois',
  type: 'emois',
 },
 async (message) => {
  await fitnessDesign(message);
 }
);

handler(
 {
  pattern: 'emoi19',
  desc: 'Technology emois',
  type: 'emois',
 },
 async (message) => {
  await technologyDesign(message);
 }
);

handler(
 {
  pattern: 'emoi20',
  desc: 'Animal Emoji emois',
  type: 'emois',
 },
 async (message) => {
  await animalEmojiDesign(message);
 }
);

handler(
 {
  pattern: 'emoi21',
  desc: 'Kiss emois',
  type: 'emois',
 },
 async (message) => {
  await kissDesign(message);
 }
);

handler(
 {
  pattern: 'emoi22',
  desc: 'Hug emois',
  type: 'emois',
 },
 async (message) => {
  await hugDesign(message);
 }
);

handler(
 {
  pattern: 'emoi23',
  desc: 'Slap emois',
  type: 'emois',
 },
 async (message) => {
  await slapDesign(message);
 }
);

handler(
 {
  pattern: 'emoi24',
  desc: 'Initiate a call conversation',
  type: 'emois',
 },
 async (message) => {
  await callConversation(message);
 }
);
