const authController = require("../middleware/authController");
const candModel = require("../models/candidat");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
  CANDIDAT_NOT_FOUND: "candidat not found",
};

const signup = async (req, res) => {
  const data = req.body;
  let existingcand;

  try {
    existingcand = await candModel.findOne({ mail: data.mail });
  } catch (err) {
    console.log(err);
  }

  if (existingcand) {
    return res.status(400).json({ error: "CandidatExisteDeja" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const candidat = new candModel({
      imageUrl: data.imageUrl,
      nom: data.nom,
      prenom: data.prenom,
      dateNais: data.dateNais,
      tel: data.tel,
      civilite: data.civilite,
      adress: data.adress,
      mail: data.mail,
      password: hashedPassword,
    });

    await candidat.save();

    return res.status(201).json({ message: "Inscription réussie" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: ERROR_MESSAGES.UNABLE_TO_ADD });
  }
};

const login = async (req, res) => {
  const data = req.body;
  return authController.authenticate(candModel, data, "Candidat", res);
};

const getCand = async (req, res) => {
  return authController.getUser(candModel, req, res);
};

const logout = (req, res) => {
  return authController.logout(res);
};

module.exports = { signup, login, getCand, logout };
