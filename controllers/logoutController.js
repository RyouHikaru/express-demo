const fsPromises = require("fs").promises;
const path = require("path");
const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleLogout = async (req, res) => {
  // Note: On client, also delete the accessToken

  const cookies = req.cookies;

  // No content
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  // Check if refreshToken is in DB
  const foundUser = userDB.users.find((u) => u.refreshToken === refreshToken);

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(403);
  }

  // Delete refreshToken in DB
  const otherUsers = userDB.users.filter(
    (u) => u.refreshToken !== foundUser.refreshToken
  );
  const currUser = { ...foundUser, refreshToken: "" };
  userDB.setUsers([...otherUsers, currUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "users.json"),
    JSON.stringify(userDB.users)
  );

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = { handleLogout };
