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
  typeCv: {
    type: String,
    enum: ["cv", "portfolio"],
  },
  letterMot: {
    typr: String,
  },
  etat: {
    type: String,
    require: true,
    default: "En Attend",
  },
});

module.exports = mongoose.model("candidature", candSchema);
