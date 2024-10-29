const config = require('../../config');
const { DataTypes } = require('sequelize');

const Scheduler = config.DATABASE.define('Schedule', {
 groupId: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
 },
 muteTime: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 unmuteTime: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 isMuted: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
 },
 isScheduled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
 },
});

module.exports = Scheduler;
