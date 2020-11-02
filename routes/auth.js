const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Session = require("../models/session");
const config = require("config");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const checkToken = require("../middlewares/checkToken");
const ms = require("ms");

const router = Router();

// auth/me
router.get("/me", checkToken, async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findOne({ where: { id } });
    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

// auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, fingerPrint } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Данного пользователя не существует" });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const { SECRET, EXPIRES_TIME } = config.get("ACCESS_TOKEN");
    const accessToken = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: EXPIRES_TIME,
    });

    const refreshToken = uuid.v4();
    Session.findOne({ where: { fingerPrint } }).then((session) =>
      session.destroy()
    );
    await Session.create({
      userId: user.id,
      refreshToken,
      fingerPrint,
      expiresIn:
        new Date().getTime() + ms(config.get("REFRESH_TOKEN_EXPIRES_TIME")),
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return res
        .status(400)
        .json({ message: "Такой пользователь уже существует" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      email,
      hashedPassword,
    });
    res.status(201).json({ data: { message: "Пользователь успешно создан" } });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

//auth/refreshtoken
router.post("/refreshtoken", async (req, res) => {
  try {
    const { refreshToken, fingerPrint } = req.body;
    const session = await Session.findOne({
      where: { refreshToken },
    });
    session.destroy();
    if (!session || session.expiresIn < Date.now()) {
      return res.status(401).json({ message: "TOKEN_EXPIRED" });
    }
    if (session.fingerPrint !== fingerPrint) {
      return res.status(401).json({ message: "INVALID_REFRESH_SESSION" });
    }

    const { SECRET, EXPIRES_TIME } = config.get("ACCESS_TOKEN");
    const accessToken = jwt.sign({ id: session.userId }, SECRET, {
      expiresIn: EXPIRES_TIME,
    });

    const newRefreshToken = uuid.v4();
    await Session.create({
      userId: session.userId,
      refreshToken: newRefreshToken,
      fingerPrint,
      expiresIn:
        new Date().getTime() + ms(config.get("REFRESH_TOKEN_EXPIRES_TIME")),
    });
    res
      .status(200)
      .json({ data: { data: { refreshToken: newRefreshToken, accessToken } } });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
