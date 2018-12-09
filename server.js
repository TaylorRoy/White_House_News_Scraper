var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/homework", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.whitehouse.gov").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    var resultArray = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("h2.article__title").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).text();
      result.link = $(this).children("a").attr("href");

      resultArray.push({
        title: result.title,
        link: result.link
      })

      console.log(result);
      
      // Create a new Article using the `result` object built from scraping
    });
    db.Article.create(resultArray)
      .then(function (dbArticle) {
        // View the added result in the console
        
        console.log(dbArticle);
        res.send(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, log it
        console.log(err);
        res.status(500).send();
      });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting all Articles from the articles.js collection
app.delete("/deleteArticles", function (req, res) {
  // Remove every document in the Articles collection
  db.Article.remove({})
    .then(function (dbArticle) {
      // If we were able to successfully remove Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//route for removing a specific article from the database
app.delete("/deleteArticle/:id", function(req, res){
  db.Article.remove({_id: req.params.id}, function(err, response){
    if (err){
      console.log(err);
    }
    else {
      res.send(response);
    }
  })
})

var noteID = "";

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
     
      noteID = dbArticle.id
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting an Article's associated Note
app.delete("/deleteNote/:id", function (req, res) {
  
  console.log("in delete route", noteID);
  // Create a new note and pass the req.body to the entry
  db.Note.remove({_id: req.params.id}, function(err, response){
    if (err) {
      console.log("Error from delete route:", err);
    }
    else {
      console.log("response from delete", response);
      res.send(response);
    }
  })
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
