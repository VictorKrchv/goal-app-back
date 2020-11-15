const Joi = require("joi");

module.exports = {
  async signup(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8).max(32),
      repassword: Joi.string().required().valid(Joi.ref("password")),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      switch (error.details[0].context.key) {
        case "email":
          res.status(207).json({
            error: "You must provide a valid email address",
          });
          break;
        case "password":
          res.status(207).json({
            error: "Password must be minimum 8 characters",
          });
          break;
        case "repassword":
          res.status(207).json({
            error: "Passwords do not match",
          });
          break;
        default:
          res.status(207).json({
            error: "Invalid registration information",
          });
      }
    } else {
      next();
    }
  },
  login: async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email(),
      password: Joi.string().required().min(8).max(32),
      fingerPrint: Joi.required(),
    });
    const { error } = schema.validate(req.body);
    console.log(error);
    if (error) {
      switch (error.details[0].context.key) {
        case "email":
          res.status(207).json({
            error: "You must provide a valid email address",
          });
          break;
        case "password":
          res.status(207).json({
            error: "Password must be minimum 8 characters",
          });
          break;
        default:
          res.status(207).json({
            error: "Invalid login information",
          });
      }
    } else {
      next();
    }
  },
};
