const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Session = require("../models/session");
const checkToken = require("../middlewares/checkToken");
const oAuthController = require("../controllers/oAuthController");

const router = Router();

// auth/me
router.get("/me", checkToken, async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findOne({
      where: { id },
      attributes: {
        include: ["email", "name", "id", "avatar"],
      },
    });
    res.json({
      data: user,
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

    const { accessToken, refreshToken } = await Session.generate({
      userId: user.id,
      fingerPrint,
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.log(error);
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
    session && (await session.destroy());
    if (!session || session.expiresIn < Date.now()) {
      return res.status(401).json({ message: "TOKEN_EXPIRED" });
    }
    if (session.fingerPrint !== fingerPrint) {
      return res.status(401).json({ message: "INVALID_REFRESH_SESSION" });
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await Session.generate({ userId: session.userId, fingerPrint });

    res
      .status(200)
      .json({ data: { data: { refreshToken: newRefreshToken, accessToken } } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

router.post("/facebook/login", oAuthController.facebook);

module.exports = router;
