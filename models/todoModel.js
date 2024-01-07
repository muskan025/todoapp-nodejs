const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
});

module.exports =   mongoose.model("todo", todoSchema);
