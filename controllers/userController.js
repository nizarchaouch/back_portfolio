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
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.verifier) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
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
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED });
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

const updateUser = async (req, role, res) => {
  try {
    const id = req.params.id;

    const newPassword = req.body.password;

    if (newPassword) {
      // Générer le sel et hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le candidat avec le nouveau mot de passe haché
      await model.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true } // Retourner le document mis à jour
      );
    } else {
      // Si le mot de passe n'est pas modifié, mettre à jour les autres informations
      const updateUser = await model.findByIdAndUpdate(id, req.body);
      if (!updateUser) {
        return res
          .status(404)
          .json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }
    }

    res.status(201).json({ message: `${role} mis à jour avec succès` });
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { authenticate, getUser, logout, updateUser };
