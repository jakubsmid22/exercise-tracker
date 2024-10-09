const mongoose = require("mongoose");
const { Schema } = mongoose;

const exerciseSchema = new Schema({
  username: String,
  date: Date,
  duration: Number,
  description: String,
  user: String
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
