const express = require("express");
const app = express();
require("dotenv").config();
const User = require("./models/user");
const Exercise = require("./models/exercise");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const user = await User.create({ username: req.body.username });
  res.status(200).json(user);
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const exercise = await Exercise.create({
    user: _id,
    description,
    duration: Number(duration),
    date: date ? new Date(date).getTime() : new Date().getTime(),
  });

  res.status(200).json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id,
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  let { limit, from, to } = req.query;

  from = from ? new Date(from) : null;
  to = to ? new Date(to) : null;

  let operators = {};
  if (from && to) {
    operators.date = { $gte: from, $lte: to };
  } else if (from) {
    operators.date = { $gte: from };
  } else if (to) {
    operators.date = { $lte: to };
  }

  limit = isNaN(limit) ? 0 : Number(limit);

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exercises = await Exercise.find({ ...operators, user: _id }).limit(
      limit
    );

    const log = exercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    }));

    res.status(200).json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the db");
  } catch (error) {
    console.log(error);
  }
  app.listen(PORT, () => console.log("Server is listening on port " + PORT));
};

start();
