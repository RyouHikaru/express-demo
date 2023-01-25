const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const cookies = req.cookies;
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: " Username and password is required." });

  try {
    const foundUser = await User.findOne({ username: username }).exec();

    if (!foundUser) return res.sendStatus(401);

    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles);
      // Create JWTs
      const accessToken = jwt.sign(
        {
          userInfo: { username: foundUser.username, roles: roles },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "120s" }
      );
      const newRefreshToken = jwt.sign(
        {
          username: foundUser.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      let newRefreshTokenArray = !cookies?.jwt
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter((token) => token !== cookies.jwt);
      
      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await User.findOne({ refreshToken: refreshToken }).exec();
        
        // Detected refresh token reuse
        if(!foundToken) newRefreshTokenArray = [];
        
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
      }

      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundUser.save();

      // Set JWT Cookie containing refreshToken with 1 day expiration
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        // secure: true, FIXME: Temporarily commented for testing purposes
        maxAge: 86400000,
      });
      res.json({ roles, accessToken });
    } else res.sendStatus(401);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogin };
