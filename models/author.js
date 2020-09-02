const mongoose = require("mongoose");
const Book = require("./book"); //used in the below pre delete method

//similar to defining a database table
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

//this function will run before the remove action occurs
// this is to prevent objects from being removed when you have other models referencing them.
authorSchema.pre("remove", function (next) {
  Book.find({ author: this.id }, (err, books) => {
    //callback method
    if (err) {
      //if mongoose throws an error (hardly likely), pass the error to the next function
      next(err);
    } else if (books.length > 0) {
      //books exist for this author so throw an error deleting
      next(new Error("This author has books still"));
    } else {
      //no books exist for this author - safe to remove
      next();
    }
  });
});

module.exports = mongoose.model("Author", authorSchema);
