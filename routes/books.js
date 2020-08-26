const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");

//used for file uploads
const multer = require("multer"); //package installed to work with multi-type forms
const path = require("path"); //need for next step
const uploadPath = path.join("public", Book.coverImageBasePath); //defined in book model
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"]; //allowed file types
const fs = require("fs");
//setup for malter (configure malter to be used with our project)
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

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
router.post("/", upload.single("cover"), async (req, res) => {
  //malta variable used above to upload a single file called "cover"
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImageName: fileName,
  });
  //save book object (above) into db now (try-catch cause its async)
  try {
    //try to save the book
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect("books");
  } catch {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true); //passsed our current book and ture for has an error
  }
});

//function to remove any book cover uploaded in error
function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.error(err);
  });
}

//custom function created for reuse between 'all books route' and 'create book route' with error handling
//its an async function since we are using 'await' inside of it
async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error creating Book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

module.exports = router;
