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
      image: data.image,
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
    return res.status(201).json({ message: offer });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ERROR_MESSAGES.UNABLE_TO_ADD });
  }
};
const show = async (req, res) => {
  try {
    const offers = await offerModel.find({});
    res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const showRec = async (req, res) => {
  try {
    const id = req.params.id;
    const offers = await offerModel.find({ idRec: id }, {});
    res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await offerModel.findByIdAndUpdate(id, req.body);
    if (!offer) {
      return res.status(404).json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }
    res.status(200).json({ message: "update" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await offerModel.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }

    res.status(200).json({ message: "Supprimé" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { add, show, showRec, update, deleteOffer };
