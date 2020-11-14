const Sequalize = require("sequelize");
const sequalize = require("../utils/database");

const User = sequalize.define("user", {
  id: {
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    type: Sequalize.BIGINT,
  },
  provider: {
    type: Sequalize.STRING,
  },
  name: {
    type: Sequalize.STRING,
  },
  email: {
    unique: true,
    type: Sequalize.STRING,
  },
  hashedPassword: {
    type: Sequalize.STRING,
  },
  avatar: {
    type: Sequalize.STRING,
  },
});

module.exports = User;
