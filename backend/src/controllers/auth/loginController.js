const { loginWithPhone } = require("../../services/authService");

const loginController = async (req, res, next) => {
  try {
    const result = await loginWithPhone(req.body.phone);
    res.json(result);
  } catch (err) {
    // Forward to error middleware if structured error
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err); // let global error handler deal with it
  }
};

module.exports = loginController;
