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
  try {
    const recruteur = await recruModel.findOne({ mail: data.mail });

    if (!recruteur) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.RECRUTEUR_NOT_FOUND });
    }

    if (!(await bcrypt.compare(data.password, recruteur.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ne renvoyez pas le mot de passe dans la réponse
    const recruteurWithoutPassword = recruteur.toJSON();
    delete recruteurWithoutPassword.password;

    //jwt
    token = jwt.sign({ _id: recruteur._id }, "nizartoken");

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
    const user = await recruModel.findOne({ _id: claims._id });
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
