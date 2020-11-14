const User = require("../models/user");
const Session = require("../models/session");

const OAuthController = {
  facebook: async (req, res, next) => {
    const { id, name, picture, graphDomain, fingerPrint } = req.body;
    const avatar = (picture.data && picture.data.url) || null;
    try {
      let user = await User.findOne({ where: { id } });
      if (!user) {
        user = await User.create({
          id,
          name,
          provider: graphDomain,
          avatar,
        });
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
            name,
            avatar,
          },
        },
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },
};

module.exports = OAuthController;
