const { DataTypes } = require('sequelize');
const { DATABASE } = require('../../config');

const AntiWord = DATABASE.define(
 'AntiWord',
 {
  groupJid: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  word: {
   type: DataTypes.STRING,
   allowNull: false,
  },
 },
 {
  indexes: [
   {
    unique: true,
    fields: ['groupJid', 'word'],
   },
  ],
 }
);

const UserWarning = DATABASE.define(
 'UserWarning',
 {
  groupJid: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  userJid: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  warningCount: {
   type: DataTypes.INTEGER,
   defaultValue: 0,
  },
 },
 {
  indexes: [
   {
    unique: true,
    fields: ['groupJid', 'userJid'],
   },
  ],
 }
);

const addUserWarning = async (groupJid, userJid) => {
 const [userWarning, created] = await UserWarning.findOrCreate({
  where: { groupJid, userJid },
  defaults: { warningCount: 1 },
 });

 if (!created) {
  userWarning.warningCount += 1;
  await userWarning.save();
 }

 return userWarning.warningCount;
};

const resetUserWarnings = async (groupJid, userJid) => {
 await UserWarning.destroy({ where: { groupJid, userJid } });
};

const getUserWarningCount = async (groupJid, userJid) => {
 const userWarning = await UserWarning.findOne({ where: { groupJid, userJid } });
 return userWarning ? userWarning.warningCount : 0;
};

const addAntiWord = async (groupJid, word) => {
 try {
  await AntiWord.create({
   groupJid,
   word: word.toLowerCase(),
  });
  return true;
 } catch (error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
   return 'exists';
  }
  return false;
 }
};

const removeAntiWord = async (groupJid, word) => {
 const result = await AntiWord.destroy({
  where: {
   groupJid,
   word: word.toLowerCase(),
  },
 });
 return result > 0;
};

const getAntiWords = async (groupJid) => {
 const words = await AntiWord.findAll({
  where: {
   groupJid,
  },
  attributes: ['word'],
 });
 return words.map((w) => w.word);
};

const checkAntiwordEnabled = async (groupJid) => {
 const words = await getAntiWords(groupJid);
 return words.length > 0;
};

module.exports = {
 AntiWord,
 UserWarning,
 addAntiWord,
 removeAntiWord,
 getAntiWords,
 checkAntiwordEnabled,
 addUserWarning,
 resetUserWarnings,
 getUserWarningCount,
};
