const mongoose = require("mongoose");

const candSchema = new mongoose.Schema({
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

module.exports = mongoose.model("candidat", candSchema);
