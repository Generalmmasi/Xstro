const config = require('../../config');
const { DataTypes } = require('sequelize');

const SudoDB = config.DATABASE.define('sudos', {
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

async function getSudo(userId) {
 return await SudoDB.findOne({
  where: {
   userId,
  },
 });
}

async function addSudo(userId) {
 let existingSudo = await getSudo(userId);

 if (!existingSudo) {
  existingSudo = await SudoDB.create({
   userId,
   createdAt: new Date(),
   updatedAt: new Date(),
  });
 } else {
  existingSudo.updatedAt = new Date();
  await existingSudo.save();
 }

 return existingSudo;
}

async function getAllSudos() {
 return await SudoDB.findAll();
}

async function deleteSudo(userId) {
 const deleted = await SudoDB.destroy({
  where: {
   userId,
  },
 });

 return deleted > 0;
}

module.exports = {
 SudoDB,
 getSudo,
 addSudo,
 getAllSudos,
 deleteSudo,
};
