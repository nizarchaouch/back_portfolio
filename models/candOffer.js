const mongoose = require("mongoose");

const candSchema = new mongoose.Schema({
  idCandidat: {
    type: String,
    require: true,
  },
  idOffer: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  etat: {
    type: String,
    require: true,
    default: "en attend",
  },
});

module.exports = mongoose.model("candidature", candSchema);
