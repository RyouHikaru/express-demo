const User = require("../model/User");

const handleLogout = async (req, res) => {
  // Note: On client, also delete the accessToken

  const cookies = req.cookies;

  // No content
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  try {
    // Check if refreshToken is in DB
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();

    if (!foundUser) {
      res.clearCookie("jwt", { httpOnly: true });
      return res.sendStatus(403);
    }

    foundUser.refreshToken = "";
    await foundUser.save();

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogout };
