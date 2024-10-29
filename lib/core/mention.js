const { DataTypes } = require('sequelize');
const { DATABASE } = require('../../config');

const MentionDB = DATABASE.define('mention_messages', {
 messageId: {
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
 },
 rawMessage: {
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: 'Hello @user, I was mentioned!',
 },
});

const getMentionMessage = async () => {
 const mentionMessage = await MentionDB.findOne();
 return mentionMessage ? mentionMessage.rawMessage : null;
};

const updateMentionMessage = async (messageId, newMessage) => {
 const mentionMessage = await MentionDB.findByPk(messageId);
 if (mentionMessage) {
  mentionMessage.rawMessage = newMessage;
  await mentionMessage.save();
 }
 return mentionMessage;
};

const addMentionMessage = async (newMessage) => {
 const mentionMessage = await MentionDB.create({ rawMessage: newMessage });
 return mentionMessage;
};

module.exports = {
 MentionDB,
 getMentionMessage,
 updateMentionMessage,
 addMentionMessage,
};
