const Sequalize = require("sequelize");
const sequalize = require("../utils/database");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const config = require("config");

const session = sequalize.define("session", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequalize.INTEGER,
  },
  fingerPrint: {
    allowNull: false,
    type: Sequalize.STRING,
  },
  userId: {
    allowNull: false,
    type: Sequalize.BIGINT,
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

session.generateTokens = function (userId) {
  const refreshToken = uuid.v4();
  const { SECRET, EXPIRES_TIME } = config.get("ACCESS_TOKEN");
  const accessToken = jwt.sign({ id: userId }, SECRET, {
    expiresIn: EXPIRES_TIME,
  });

  return { refreshToken, accessToken };
};

session.generate = async function ({ userId, fingerPrint }) {
  const { accessToken, refreshToken } = session.generateTokens(userId);

  await session.destroy({
    where: { fingerPrint, userId },
  });

  await session.create({
    fingerPrint,
    userId,
    refreshToken,
    expiresIn:
      new Date().getTime() + ms(config.get("REFRESH_TOKEN_EXPIRES_TIME")),
  });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = session;
