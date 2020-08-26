const mongoose = require("mongoose");
const path = require("path");

//define file upload base path (inside public directory)
const coverImageBasePath = "uploads/bookCovers";

//similar to defining a database table
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  coverImageName: {
    type: String,
    required: true,
    ref: "Author",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

//created a virtual property
bookSchema.virtual("coverImagePath").get(function () {
  //didn't use arror function since we need access to 'this' object
  //if this book has a cover image applied to it
  if (this.coverImageName != null) {
    return path.join("/", coverImageBasePath, this.coverImageName); //note: require path module. Also the '/' path is really the public path
  }
});

module.exports = mongoose.model("Book", bookSchema);
module.exports.coverImageBasePath = coverImageBasePath; //esported the base path
