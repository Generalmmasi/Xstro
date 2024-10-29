const config = require('../../config');
const { DataTypes } = require('sequelize');

const BansDB = config.DATABASE.define('bans', {
 userId: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
 },
 createdAt: {
  type: DataTypes.DATE,
  allowNull: false,
 },
 updatedAt: {
  type: DataTypes.DATE,
  allowNull: false,
 },
});

async function getBan(userId) {
 return await BansDB.findOne({
  where: {
   userId,
  },
 });
}

async function banUser(userId) {
 const existingBan = await getBan(userId);
 if (!existingBan) {
  return await BansDB.create({
   userId,
   createdAt: new Date(),
   updatedAt: new Date(),
  });
 }
 return null;
}

async function unbanUser(userId) {
 return await BansDB.destroy({
  where: {
   userId,
  },
 });
}

async function getBannedUsers() {
 return await BansDB.findAll({
  attributes: ['userId'],
 });
}

module.exports = {
 BansDB,
 banUser,
 unbanUser,
 getBan,
 getBannedUsers,
};
