const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    require: true,
    default: "/defaultprofil.png",
  },
  nom: {
    type: String,
    require: true,
  },
  prenom: {
    type: String,
    require: true,
  },
  dateNais: {
    type: Date,
    require: true,
  },
  tel: {
    type: Number,
    require: true,
  },
  civilite: {
    type: String,
    require: true,
  },
  adress: {
    type: String,
    require: true,
  },
  mail: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  titre_emploi: {
    type: String,
    require: true,
  },
  cvPath: {
    type: String,
    require: true,
  },
  verifier: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["candidat", "recruteur", "admin"],
    default: "candidat",
  },
  urlfacebook: { type: String },
  urltwitter: { type: String },
  urlgithub: { type: String },
  urllinkedin: { type: String },
  socialLinks: {
    type: Array,
  },
  // recruteur
  nomEntreprise: {
    type: String,
    require: true,
  },
  logoPath: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  identifiant: {
    type: String,
    require: true,
  },
  secteur: {
    type: String,
    require: true,
  },
  fondee: {
    type: Number,
  },
  taill_ent: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);
