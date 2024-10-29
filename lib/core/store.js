const { isJidGroup } = require('baileys');
const { DataTypes } = require('sequelize');
const { DATABASE } = require('../../config');

const chatDb = DATABASE.define('Chat', {
 id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
 conversationTimestamp: { type: DataTypes.INTEGER, allowNull: false },
 isGroup: { type: DataTypes.BOOLEAN, allowNull: false },
});

const messageDb = DATABASE.define('Message', {
 jid: { type: DataTypes.STRING, allowNull: false },
 message: { type: DataTypes.JSON, allowNull: false },
 id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
});

const contactDb = DATABASE.define('Contact', {
 jid: { type: DataTypes.STRING, allowNull: false },
 name: { type: DataTypes.STRING, allowNull: false },
});

const saveContact = async (jid, name) => {
 if (!jid || !name || isJidGroup(jid)) return;
 const contact = await contactDb.findOne({ where: { jid } });
 if (contact) {
  if (contact.name !== name) await contactDb.update({ name }, { where: { jid } });
 } else {
  await contactDb.create({ jid, name });
 }
};

const saveMessage = async (message, user) => {
 const { remoteJid: jid, id } = message?.key || {};
 if (!jid || !id) return;
 await saveContact(user, message.pushName);
 const existing = await messageDb.findOne({ where: { id, jid } });
 if (existing) {
  await messageDb.update({ message }, { where: { id, jid } });
 } else {
  await messageDb.create({ id, jid, message });
 }
};

const loadMessage = async (id) => {
 if (!id) return false;
 const message = await messageDb.findOne({ where: { id } });
 return message ? message.dataValues : false;
};

const saveChat = async (chat) => {
 const { id, conversationTimestamp } = chat || {};
 if (!id || !conversationTimestamp || id === 'status@broadcast' || id === 'broadcast') return;
 const isGroup = isJidGroup(id);
 const existing = await chatDb.findOne({ where: { id } });
 if (existing) {
  await chatDb.update({ conversationTimestamp }, { where: { id } });
 } else {
  await chatDb.create({ id, conversationTimestamp, isGroup });
 }
};

const getName = async (jid) => {
 if (!jid) return;
 const contact = await contactDb.findOne({ where: { jid } });
 return contact ? contact.name : jid.split('@')[0].replace(/_/g, ' ');
};

module.exports = { saveMessage, loadMessage, saveChat, getName };
