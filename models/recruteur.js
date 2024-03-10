const mongoose = require("mongoose");

const candSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    require: true,
  },
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
});

module.exports = mongoose.model("recruteur", candSchema);
