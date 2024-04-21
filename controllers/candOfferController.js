const candModel = require("../models/candOffer");
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
  CANDIDAT_NOT_FOUND: "Candidature not found",
};

const add = async (req, res) => {
  const data = req.body;
  try {
    const candoffer = new candModel({
      idCandidat: data.idCandidat,
      idOffer: data.idOffer,
      date: new Date(),
    });
    await candoffer.save();
    return res.status(201).json({ message: candoffer });
  } catch (error) {
    return res.status(201).json({ message: ERROR_MESSAGES.UNABLE_TO_ADD });
  }
};

const showCandOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const candOffer = await candModel.find({ idCandidat: id }, {});
    res.status(200).json(candOffer);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
module.exports = { add, showCandOffer };
