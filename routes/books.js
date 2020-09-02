const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");

//used for file uploads
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"]; //allowed file types

//All books
router.get("/", async (req, res) => {
  //implement search functionality (build the query)
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i")); //apply regex on the title field of the model
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  //execute db query
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

//New Book (Form sent to view)
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//Create Book Route (Form handler)
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  //save book object (above) into db now (try-catch cause its async)
  saveCover(book, req.body.cover);
  try {
    //try to save the book
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true); //passsed our current book and ture for has an error
  }
});

//Show book route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book });
  } catch {
    res.redirect("/");
  }
});

//Edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

//Update Book Route (Form handler) - copied from POst route
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id); //get book object from db
    //update object with params from form
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save(); //save/update to db
    res.redirect(`/books/${book.id}`);
  } catch {
    //means correct id passed to put route but some error while saving
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      //means maybe an incorrect id was passed to put route so no book found
      redirect("/");
    }
  }
});

// Delete Book Page
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books");
  } catch {
    if (book != null) {
      //book found but was unable to delete from db for some reason
      res.render("books/show", {
        //lets just show to book with an error on screen
        book: book,
        errorMessage: "Could not remove book",
      });
    } else {
      //no book found to delete with that id
      res.redirect("/");
    }
  }
});

//custom function created for reuse between 'all books route' and 'create book route' with error handling
//its an async function since we are using 'await' inside of it
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error editing Book";
      } else {
        params.errorMessage = "Error creating Book";
      }
    }

    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  //this function will create the book object from the filepond object received in the request.body.cover
  //refer to the Filepond documentation to understand
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded); //parse encoded to a json format and store in cover variable
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
