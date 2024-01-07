const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    _id: String,
  },
  { strict: false }
);

module.exports =  mongoose.model("session", sessionSchema);
