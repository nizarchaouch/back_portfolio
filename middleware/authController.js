require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const model = require("../models/user");

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
  INVALID_CREDENTIALS: "Invalid credentials",
  UNAUTHENTICATED: "Unauthenticated",
  USER_NOT_FOUND: "User not found",
  EMAIL_NOT_VERIFIED: "Email not verified",
};

const authenticate = async (data, role, res) => {
  try {
    const user = await model.findOne({ mail: data.mail });

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.verifier) {
      return res.status(401).json({ message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "hellojwt"
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Successfully Logged In" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const getUser = async (req, res) => {
  try {
    const secretKey = process.env.JWT_SECRET || "hellojwt";

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, secretKey);

    if (!claims) {
      return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHENTICATED });
    }

    const user = await model.findOne({ _id: claims._id });

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    if (!user.verifier) {
      return res.status(401).json({message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
    }

    // const userWithoutPassword = user.toJSON();
    // delete userWithoutPassword.password;

    res.send(user.toJSON());
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const logout = (res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { authenticate, getUser, logout };
