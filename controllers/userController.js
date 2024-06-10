require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const model = require("../models/user");
const { errorMonitor } = require("nodemailer/lib/xoauth2");

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

    const isPasswordValid = bcrypt.compare(data.password, user.password);
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
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

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
    const secretKey = process.env.JWT_SECRET;

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

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.send(userWithoutPassword);
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

const updateUser = async (req, res) => {
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
        return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }
    }

    res.status(201).json({ message: `User mis à jour avec succès` });
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const forget = async (req, res) => {
  const mail = req.body.mail;

  try {
    const user = await model.findOne({ mail });

    if (!user) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }

    // Générer un jeton de réinitialisation de mot de passe et le stocker dans l'objet utilisateur
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    user.resetToken = resetToken;
    await user.save();

    // Envoyer un email à l'utilisateur avec un lien pour réinitialiser le mot de passe
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: "nizar@gmail.com",
      to: mail,
      subject: "Demande de réinitialisation de mot de passe",
      html: `
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour le réinitialiser :</p>
        <a href="http://localhost:8080/reset_password/${resetToken}">http://localhost:8080/reset_password</a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Échec de l'envoi de l'email" });
      } else {
        console.log("Email envoyé : " + info.response);
        return res.status(200).json({ message: "Email envoyé" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const reset = async (req, res) => {
  const resetToken = req.body.resetToken;
  const password = req.body.password;

  try {
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await model.findOne({ _id: decodedToken.id, resetToken });

    if (!user) {
      return res.status(400).json({ message: "Jeton invalide ou expiré" });
    }

    // Update user password and remove reset token
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = null;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.mail,
      from: "nizar@gmail.com",
      subject: "Changement de mot de passe",
      text: `
        Bonjour,

        Ceci est une confirmation que le mot de passe de votre compte ${user.mail} vient d'être modifié.
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      }
    });

    return res
      .status(200)
      .json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = { authenticate, getUser, logout, updateUser, forget, reset };
