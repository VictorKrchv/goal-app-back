const Sequalize = require("sequelize");
const sequalize = require("../utils/database");

const session = sequalize.define("session", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequalize.INTEGER,
  },
  fingerPrint: {
    unique: true,
    allowNull: false,
    type: Sequalize.STRING,
  },
  userId: {
    allowNull: false,
    type: Sequalize.INTEGER,
  },
  refreshToken: {
    type: Sequalize.STRING,
    allowNull: false,
  },
  expiresIn: {
    type: Sequalize.BIGINT,
    allowNull: false,
  },
});

module.exports = session;
