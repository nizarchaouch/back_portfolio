const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const model = require("../models/user");
const multer = require("multer");
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNABLE_TO_ADD: "Unable to add",
};

const authenticate = async (data, role, res) => {
  try {
    const user = await model.findOne({ mail: data.mail });

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    if (!(await bcrypt.compare(data.password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    //jwt
    const token = jwt.sign({ _id: user._id }, "nizartoken");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Successfully Logged In" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const getUser = async (req, res) => {
  try {
    const secretKey = process.env.JWT_SECRET || "nizartoken";

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, secretKey);

    if (!claims) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const user = await model.findOne({ _id: claims._id });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // const userWithoutPassword = user.toJSON();
    // delete userWithoutPassword.password;

    res.send(user.toJSON());
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const logout = (res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
// upload image
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const uploadFile = multer({ storage: storage });
// const upload = (uploadFile.single("image"), async (req, res) => {
//   try {
//     if (req.file) {
//       const imagepath = req.file.path.replace(/\\/g, "/").replace("public", "");
//       res.json({ message: "ok!", imagepath: imagepath.replace("src/", "") });
//     } else {
//       res.json({ message: "file not upload" });
//     }
//   } catch (error) {
//     res.json({ message: "error", error: er });
//   }
// });

module.exports = { authenticate, getUser, logout };
