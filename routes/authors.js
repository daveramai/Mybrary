const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
//All authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i"); //regex search with case insensitive
  }
  // console.log(searchOptions);
  try {
    //async get all authors from the db
    const authors = await Author.find(searchOptions);
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

//New Author (Form sent to view)
//NB: This route must be placed here before the /:id routes to work properly !!!!!!!!!!!!!!!!!!!!!!
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
});

router.get("/:id", async (req, res) => {
  //use try-catch for code that could potentially fail
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(5).exec();
    res.render("authors/show", {
      author: author,
      booksByAuthor: books,
    });
  } catch (err) {
    //if above fails
    // console.log(err)
    res.redirect("/");
  }
});

// this will be similar to the /new route
// NB: will GET the form on screen that the PUT route will update when submitted
router.get("/:id/edit", async (req, res) => {
  try {
    //query the db for the author based on id param
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author }); //same as {author: author}
  } catch {
    //if error fetching the author from the db, redirect
    res.redirect("/authors");
  }
});

//will be similar to the create author route or POST route.
router.put("/:id", async (req, res) => {
  let author; //defined outside the try block so it is avail in the catch block as well
  try {
    author = await Author.findById(req.params.id); //get author
    author.name = req.body.name; //update the author name object
    await author.save(); //save author object
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author === null) {
      //then the Author.findById didnt return anything
      res.redirect("/");
    } else {
      //id found but failed saving the author
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating author",
      });
    }
  }
});

//almost similar to the put method now
router.delete("/:id", async (req, res) => {
  let author; //defined outside the try block so it is avail in the catch block as well
  try {
    author = await Author.findById(req.params.id); //get author
    await author.remove(); //remove author object
    res.redirect("/authors");
  } catch {
    if (author === null) {
      //then the Author.findById didnt return anything
      res.redirect("/");
    } else {
      //if failed removing the author
      res.redirect(`/authors/${author.id}`); //string interpolation used
    }
  }
});

module.exports = router;
