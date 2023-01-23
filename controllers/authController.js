const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fsPromises = require("fs").promises;
const path = require("path");
require("dotenv").config;
const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleLogin = async (req, res) => {
  const { user, password } = req.body;
  if (!user || !password)
    return res
      .status(400)
      .json({ message: " Username and password is required." });

  const foundUser = userDB.users.find((u) => u.username === user);

  if (!foundUser) return res.sendStatus(401);

  const match = await bcrypt.compare(password, foundUser.password);
  console.log(`Access token secret: ${process.env.REFRESH_TOKEN_SECRET}`);

  if (match) {
    // Create JWTs
    const accessToken = jwt.sign(
      {
        username: foundUser.username,
      },
      "process.env.ACCESS_TOKEN_SECRET",
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      {
        username: foundUser.username,
      },
      "process.env.REFRESH_TOKEN_SECRET",
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    const otherUsers = userDB.users.filter(
      (u) => u.username !== foundUser.username
    );
    const currUser = { ...foundUser, refreshToken };
    userDB.setUsers([...otherUsers, currUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDB.users)
    );
    // Set JWT Cookie containing refreshToken with 1 day expiration
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 86400000,
    });
    res.json({ accessToken });
  } else res.sendStatus(401);
};

module.exports = { handleLogin };
