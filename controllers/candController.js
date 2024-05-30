const authController = require("./userController");
const candModel = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
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
    //send mail verifie
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nizar.chaouch@polytechnicien.tn",
        pass: "rpft gvgn crpp rtpa",
      },
    });
    const mailOptions = {
      from: "nizar.chaouch@polytechnicien.tn",
      to: data.mail,
      subject: "Vérification d'email",
      html: `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification d'e-mail</title>
        <style>
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
          }
          h1 {
            color: #333;
          }
          p {
            margin-bottom: 20px;
            color: #666;
          }
          button {
            display: inline-block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #74b4f7;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
          }
          button:hover {
            background-color: #0056b3;
          }
          button a {
            color: #fff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Vérification d'e-mail</h1>
          <p>Cher ${data.nom} ${data.prenom},</p>
          <p>Bienvenue sur notre site, votre compte a été créé avec succès,, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
          <button><a href="http://localhost:8000/api/user/verifier/${data.mail}" style="color: #fff;">Vérifier maintenant</a></button>
        </div>
      </body>
      </html>
        
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({ message: "Email sent" });
      }
    });

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

const verifCand = async (req, res) => {
  const mail = req.params.mail;
  try {
    const cand = await candModel.findOneAndUpdate(
      { mail: mail },
      { verifier: true },
      { new: true } // Retourner le document mis à jour
    );
    if (!cand) {
      return res.status(404).json({ message: "Candidat non trouvé", mail });
    }
    // res.status(200).json({ message: "Candidat vérifié avec succès" });
    return res.redirect("http://localhost:8080/login");
  } catch (error) {
    console.error("Erreur lors de la vérification du candidat :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la vérification du candidat" });
  }
};
module.exports = { signup, login, getCand, logout, updateCand, verifCand };
