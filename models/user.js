const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    require: true,
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
  verifier: {
    type: Boolean,
    default: false,
  },
  role:{
    type:String,
    default:"candidat",
  },
  urlfacebook: { type: String },
  urltwitter: { type: String },
  urlgithub: { type: String },
  urllinkedin: { type: String },
  // recruteur
  nomEntreprise: {
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
});

module.exports = mongoose.model("user", userSchema);
