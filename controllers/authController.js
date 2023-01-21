const bcrypt = require("bcrypt");
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

  if (match) {
    // TODO: Create JWTs
    res.json({ success: `User ${user} is logged in.` });
  }
  else res.sendStatus(401);
};

module.exports = { handleLogin };
