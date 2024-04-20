const express = require("express");
const cookieParser = require("cookie-parser");

const multer = require("multer");
const path = require("path");

const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const candRouter = require("./routes/candidat");
const recruRouter = require("./routes/recruteurR");
const offerRouter = require("./routes/offerR");
const CandOfferRouter = require("./routes/candOfferR");

app.use(
  cors({
    origin: "http://localhost:8080",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const database = (module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/portfolio");
    console.log("Database connected succesfully");
  } catch (error) {
    console.log(error);
    console.log("Database connection failed");
  }
});

database();

app.use("/api/user", candRouter, recruRouter);
app.use("/api/offer", offerRouter);
app.use("/api/candidature", CandOfferRouter);

// upload image

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (req.file) {
      const imagepath = req.file.path.replace(/\\/g, "/").replace("public", "");
      res.json({ message: "ok!", imagepath: imagepath.replace("src/", "") });
    } else {
      res.json({ message: "file not upload" });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
});
app.post("/uploadCv", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      const cvpath = req.file.path.replace(/\\/g, "/").replace("public", "");
      res.json({ message: "ok!", cvpath: cvpath.replace("src/", "") });
    } else {
      res.json({ message: "file not upload" });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
});

app.listen(8000, () => {
  console.log("server on port 8000");
});
