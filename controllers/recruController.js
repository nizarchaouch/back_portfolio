const authController = require("../middleware/authController");
const recruModel = require("../models/recruteur");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
  RECRUTEUR_NOT_FOUND: "recruteur not found",
};

const signup = async (req, res) => {
  const data = req.body;
  let existingrecru;

  try {
    existingrecru = await recruModel.findOne({ mail: data.mail });
  } catch (err) {
    console.log(err);
  }

  if (existingrecru) {
    return res.status(400).json({ error: "RecruteurExisteDeja" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const recruteur = new recruModel({
      imageUrl: data.imageUrl,
      nomEntreprise: data.nomEntreprise,
      description: data.description,
      identifiant: data.identifiant,
      secteur: data.secteur,
      nom: data.nom,
      prenom: data.prenom,
      dateNais: data.dateNais,
      tel: data.tel,
      civilite: data.civilite,
      adress: data.adress,
      mail: data.mail,
      password: hashedPassword,
    });

    await recruteur.save();

    return res.status(201).json({ message: "Inscription réussie" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: ERROR_MESSAGES.UNABLE_TO_ADD });
  }
};

const login = async (req, res) => {
  const data = req.body;
  return authController.authenticate(recruModel, data, "Recruteur", res);
};

const getRec = async (req, res) => {
  return authController.getUser(recruModel, req, res);
};

const logout = (req, res) => {
  return authController.logout(res);
};

module.exports = { signup, login, getRec, logout };
