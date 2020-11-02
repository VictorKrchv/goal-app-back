const Sequalize = require("sequelize");
const sequalize = require("../utils/database");

const user = sequalize.define("user", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequalize.INTEGER,
  },
  email: {
    unique: true,
    type: Sequalize.STRING,
    allowNull: false,
  },
  hashedPassword: {
    type: Sequalize.STRING,
    allowNull: false,
  },
});

module.exports = user;
