const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const candRouter = require("./routes/candidat");
const recruRouter = require("./routes/recruteurR");

app.use(
  cors({
    origin: "http://localhost:8080",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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

app.use("/api", candRouter);

app.listen(8000, () => {
  console.log("server on port 8000");
});
