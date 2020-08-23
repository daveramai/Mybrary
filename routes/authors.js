const express = require("express");
const router = express.Router();
const Author = require("../models/author");

//All authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i"); //regex search with case insensitive
  }
  console.log(searchOptions);
  try {
    //async get all authors from the db
    const authors = await Author.find(searchOptions);
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

//New Author (Form sent to view)
router.get("/new", (req, res) => {
  //renders an ejs and passed a variable called author
  res.render("authors/new", { author: new Author() });
});

//Create Author Route (Form handler)
router.post("/", async (req, res) => {
  //create a new author object
  const author = new Author({
    name: req.body.name,
  });
  //Save to the database (using async await rather)
  try {
    //asynchronously wait for mongoose and mongodb to save
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`) //will be used redirect to the latest author created
    res.redirect(`authors`);
  } catch {
    //if error adding to db, return to the new author page and send values to ejs page
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating author",
    });
  }
  //save to the database (using callback function)
  // author.save((err, newAuthor) => {
  //   if (err) {
  //     //if error adding to db, return to the new author page and send values to ejs page
  //     res.render("authors/new", {
  //       author: author,
  //       errorMessage: "Error creating author",
  //     });
  //   } else {
  //     // res.redirect(`authors/${newAuthor.id}`) //will be used redirect to the latest author created
  //     res.redirect(`authors`);
  //   }
  // });
});

module.exports = router;
