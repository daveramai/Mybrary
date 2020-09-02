const mongoose = require("mongoose");

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
  coverImage: {
    type: Buffer,
    required: true,
  },
  coverImageType: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Author",
  },
});

//created a virtual property called coverImagePath called as book.coverImagePath
bookSchema.virtual("coverImagePath").get(function () {
  //didn't use arroy function since we need access to 'this' object
  //if this book has a cover image applied to it
  if (this.coverImage != null && this.coverImageType != null) {
    //used template literal to embed variables and html code
    return `data:${
      this.coverImageType
    };charset=utf-8;base64,${this.coverImage.toString("base64")}`;
  }
});

module.exports = mongoose.model("Book", bookSchema);
