const { registerUser } = require("../../services/authService");

const registerController = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(result.status).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err); // pass to global error handler
  }
};

module.exports = registerController;
