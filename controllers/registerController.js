const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");
const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleNewUser = async (req, res) => {
  const { user, password } = req.body;
  if (!user || !password)
    return res
      .status(400)
      .json({ message: " Username and password is required." });

  // Check for duplicate username
  const duplicate = userDB.users.find((u) => u.username === user);

  if (duplicate) return res.sendStatus(409);

  try {
    // Encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Store the new user
    const newUser = { username: user, password: hashedPwd };
    userDB.setUsers([...userDB.users, newUser]);

    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDB.users)
    );
    console.log(userDB.users);
    res.status(201).json({ success: `New user ${user} created.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
