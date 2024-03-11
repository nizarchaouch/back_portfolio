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
  try {
    const candidat = await candModel.findOne({ mail: data.mail });

    if (!candidat) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.CANDIDAT_NOT_FOUND });
    }

    if (!(await bcrypt.compare(data.password, candidat.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ne renvoyez pas le mot de passe dans la réponse
    const candidatWithoutPassword = candidat.toJSON();
    delete candidatWithoutPassword.password;

    //jwt
    token = jwt.sign({ _id: candidat._id }, "nizartoken");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // maxAge: 5000,
    });

    return res.status(200).json({ message: "Successfully Logged In" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const getCand = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "nizartoken");

    if (!claims) {
      return res.status(401).json({ message: "unauthenticated" });
    }
    const user = await candModel.findOne({ _id: claims._id });
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

const logout = (req, res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = { signup, login, getCand, logout };
