const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  idRec: {
    type: String,
    require: true,
  },
  nomEntreprise: {
    type: String,
    require: true,
  },
  titre: {
    type: String,
    require: true,
  },
  position: {
    type: String,
    require: true,
  },
  vacants: {
    type: Number,
    require: true,
    default: 1,
  },
  typeOffer: {
    type: String,
    require: true,
  },
  experience: {
    type: String,
    require: true,
  },
  niveauCand: {
    type: String,
    require: true,
  },
  langue: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  exigence: {
    type: String,
    require: true,
  },
  date_creation: {
    type: Date,
    require: true,
  },
  date_expiration: {
    type: Date,
    require: true,
  },
  motCle: {
    type: Array,
    require: true,
  },
});

module.exports = mongoose.model("offer", offerSchema);
