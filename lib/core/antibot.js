const { DataTypes } = require('sequelize');
const config = require('../../config');

const AntiBot = config.DATABASE.define('AntiBot', {
 groupJid: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
 },
 mode: {
  type: DataTypes.ENUM('on', 'warn', 'kick'),
  allowNull: false,
 },
});

const AntiBotWarnings = config.DATABASE.define(
 'AntiBotWarnings',
 {
  groupJid: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  participant: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  warnings: {
   type: DataTypes.INTEGER,
   defaultValue: 0,
  },
 },
 {
  indexes: [{ unique: true, fields: ['groupJid', 'participant'] }],
 }
);

module.exports = {
 AntiBot,
 AntiBotWarnings,
 async getAntiBot(groupJid) {
  return await AntiBot.findOne({
   where: {
    groupJid,
   },
  });
 },
 async setAntiBot(groupJid, mode) {
  return await AntiBot.upsert({
   groupJid,
   mode,
  });
 },
 async deleteAntiBot(groupJid) {
  return await AntiBot.destroy({
   where: {
    groupJid,
   },
  });
 },
 async getWarnings(groupJid, participant) {
  const entry = await AntiBotWarnings.findOne({
   where: {
    groupJid,
    participant,
   },
  });
  return entry ? entry.warnings : 0;
 },
 async warnParticipant(groupJid, participant) {
  const entry = await AntiBotWarnings.findOne({
   where: {
    groupJid,
    participant,
   },
  });
  if (entry) {
   entry.warnings += 1;
   await entry.save();
   return entry.warnings;
  } else {
   await AntiBotWarnings.create({
    groupJid,
    participant,
    warnings: 1,
   });
   return 1;
  }
 },
 async rWarns(groupJid, participant) {
  await AntiBotWarnings.destroy({
   where: {
    groupJid,
    participant,
   },
  });
 },
};
