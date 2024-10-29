const { tiny, localBuffer } = require('xstro');
const { SudoDB, getBan } = require('./core');
const config = require('../config');

global.ban = tiny(`you are banned from this bot!`);
global.owner = tiny(`for owners only!`);
global.group = tiny(`for groups only!`);
global.admin = tiny(`for admin only!`);

async function getMode(owner, user) {
 if (config.MODE.toLowerCase() === 'private') {
  return owner === true;
 } else if (config.MODE.toLowerCase() === 'public') {
  return owner === true || user === true;
 } else {
  return false;
 }
}

async function isSudo(userId) {
 if (!userId) return false;
 const id = userId.split('@')[0];
 const exists = await SudoDB.findOne({ where: { userId: id } });
 return !!exists;
}

async function isBan(userId) {
 const bannedUser = await getBan(userId);
 return !!bannedUser;
}

async function getImages() {
 try {
 } catch {
  const buff = await localBuffer(path.join(__dirname, '..', 'media', 'defaults', 'thumb.jpg'));
  return buff;
 }
}

module.exports = {
 getMode,
 isSudo,
 isBan,
 getImages,
};
