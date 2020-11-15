const { Router } = require("express");
const Policy = require("../controllers/PolicyController");
const checkToken = require("../middlewares/checkToken");
const oAuthController = require("../controllers/oAuthController");

const router = Router();

router.get("/me", checkToken, oAuthController.getDataByToken);

router.post("/login", Policy.login, oAuthController.local);

router.post("/register", Policy.signup, oAuthController.register);

router.post("/refreshtoken", oAuthController.refreshToken);

router.post("/facebook/login", oAuthController.facebook);

module.exports = router;
