const { sendOtp } = require("../../services/authService");

const sendOtpController = async (req, res, next) => {
  try {
    const result = await sendOtp(req.body.phone);
    res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = sendOtpController;
