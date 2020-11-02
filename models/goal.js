const Sequalize = require("sequelize");
const sequalize = require("../utils/database");
const User = require("./user");

const Goal = sequalize.define("goal", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequalize.INTEGER,
  },
  title: {
    type: Sequalize.STRING,
    allowNull: false,
  },
  goalCompletion: {
    type: Sequalize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequalize.STRING,
    allowNull: false,
  },
});

const PlanList = sequalize.define("plan", {
  name: {
    type: Sequalize.STRING,
    allowNull: false,
  },
  isComplete: {
    type: Sequalize.BOOLEAN,
    defaultValue: false,
  },
});

Goal.belongsTo(User, { as: "author" });
Goal.hasMany(PlanList);

module.exports = {
  Goal,
  PlanList,
};
