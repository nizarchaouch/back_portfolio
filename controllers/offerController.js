const offerModel = require("../models/offer");
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
  OFFER_NOT_FOUND: "offer not found",
};

const add = async (req, res) => {
  const data = req.body;
  try {
    const offer = new offerModel({
      idRec: data.idRec,
      nomEntreprise: data.nomEntreprise,
      titre: data.titre,
      position: data.position,
      vacants: data.vacants,
      typeOffer: data.typeOffer,
      experience: data.experience,
      niveauCand: data.niveauCand,
      langue: data.langue,
      description: data.description,
      exigence: data.exigence,
      date_creation: data.date_creation,
      date_expiration: data.date_expiration,
      motCle: data.motCle,
    });

    await offer.save();
    return res.status(201).json({ mesaage: "réussie" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ERROR_MESSAGES.UNABLE_TO_ADD });
  }
};

const show = async (req, res) => {
  try {
    const offers = await offerModel.find({});
    res.json(offers);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { add, show };
