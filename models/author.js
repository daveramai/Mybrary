const mongoose = require("mongoose");

//similar to defining a database table
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Author", authorSchema);
