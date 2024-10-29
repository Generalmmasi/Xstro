const config = require('../../config');
const { DataTypes } = require('sequelize');

// Define AliveDB schema
const AliveDB = config.DATABASE.define('aliveMessages', {
  messageId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

// Function to get the most recent alive message
async function getAliveMessage() {
  return await AliveDB.findOne({
    order: [['createdAt', 'DESC']],
  });
}

// Function to add a new alive message
async function addAliveMessage(message) {
  const newAliveMessage = await AliveDB.create({
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return newAliveMessage;
}

// Function to update an existing alive message
async function updateAliveMessage(messageId, newMessage) {
  const aliveMessage = await AliveDB.findByPk(messageId);

  if (aliveMessage) {
    aliveMessage.message = newMessage;
    aliveMessage.updatedAt = new Date();
    await aliveMessage.save();
  }

  return aliveMessage;
}

// Function to delete an alive message by ID
async function deleteAliveMessage(messageId) {
  const deleted = await AliveDB.destroy({
    where: {
      messageId,
    },
  });

  return deleted > 0;
}

// Export the AliveDB and related functions
module.exports = {
  AliveDB,
  getAliveMessage,
  addAliveMessage,
  updateAliveMessage,
  deleteAliveMessage,
};
