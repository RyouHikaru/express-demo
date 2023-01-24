const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: " Username and password is required." });

  // Check for duplicate username
  const duplicate = await User.findOne({ username: username }).exec();

  if (duplicate) return res.sendStatus(409);

  try {
    // Encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Create and Store the new user
    const result = await User.create({
      username: username,
      password: hashedPwd,
    });

    res.status(201).json({ success: `New user ${result.username} created.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
