const express = require("express");
const sequilize = require("./utils/database");
const config = require("config");
const cors = require("cors");
const app = express();

app.use(express.json({ extended: true }));

app.use(cors());
app.use("/auth", require("./routes/auth"));
app.use("/goal", require("./routes/goal"));

const PORT = config.get("PORT") | 5000;

async function start() {
  try {
    await sequilize.sync();
    app.listen(PORT, () => console.log(`Server is running in PORT:${PORT}`));
  } catch (error) {
    console.log(error);
  }
}

start();
