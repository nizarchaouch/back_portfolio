const authController = require("../middleware/authController");
const candModel = require("../models/user");
const bcrypt = require("bcryptjs");
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
      imagePath: data.imagePath,
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
  return authController.authenticate(data, "Candidat", res);
};

const getCand = async (req, res) => {
  return authController.getUser(req, res);
};

const logout = (req, res) => {
  return authController.logout(res);
};

const updateCand = async (req, res) => {
  try {
    const id = req.params.id;

    const newPassword = req.body.password;

    if (newPassword) {
      // Générer le sel et hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le candidat avec le nouveau mot de passe haché
      await candModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true } // Retourner le document mis à jour
      );
    } else {
      // Si le mot de passe n'est pas modifié, mettre à jour les autres informations
      const updateCand = await candModel.findByIdAndUpdate(id, req.body);
      if (!updateCand) {
        return res
          .status(404)
          .json({ message: ERROR_MESSAGES.CANDIDAT_NOT_FOUND });
      }
    }

    res.status(201).json({ message: "Candidat mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { signup, login, getCand, logout, updateCand };
