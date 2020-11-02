const Sequilize = require("sequelize");
const config = require("config");

const dbConfig = config.get("DB_CONFIG");

const sequelize = new Sequilize(
  dbConfig.DB_NAME,
  dbConfig.USER_NAME,
  dbConfig.PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);
// User.hasMany(Session, { foreignKey: "id" });
// Session.belongsTo(User, {
//   foreignKey: "userId",
//   targetKey: "id",
// });
module.exports = sequelize;
