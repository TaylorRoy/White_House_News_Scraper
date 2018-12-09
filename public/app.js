// Scrape articles and save into Articles.js collection
$(document).on("click", ".scrapeButton", function (event) {

  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function (data) {
    console.log("in scrape route", data);
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      console.log(data[i]);
      $("#articles").append("<p class='article_infomation' data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
      $("#articles").append("<button type=button class=addNoteButton btn btn-default data-id='" + data[i]._id + "'>" + "Add Note" + "</button>");
    }
  });
});

//Display all articles in Articles.js collection
$(document).on("click", ".displayButton", function () {

  $.ajax({
    method: "GET",
    url: "/articles"
  }).then(function (data) {
    console.log("in scrape route", data);
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      console.log(data[i]);
      $("#articles").append("<p class='article_infomation' data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
      $("#articles").append("<button type='button' class= 'addNoteButton btn btn-default btn-danger' data-id='" + data[i]._id + "'>" + "Add Note" + "</button>");
      $("#articles").append("<button type='button' class= 'deleteArticleButton btn btn-default' data-id='" + data[i]._id + "'>" + "Delete Article" + "</button>");
    }
  });
})

// Delete articles from Articles.js collection
$(document).on("click", ".deleteButton", function (event) {

  $.ajax({
    method: "DELETE",
    url: "/deleteArticles"
  }).then(function (data) {
    console.log("in delete route", data);
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      console.log(data[i]);
    }
    $("#articles").empty();
    $("#articles").prepend("<p>" + "All articles have been removed from the collection" + "</p>");
  });
});

// Whenever someone clicks a Add Note Button
$(document).on("click", ".addNoteButton", function () {
  // Empty the notes from the note section
  // $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // console.log("note id", data.note._id);
      // The title of the article
      $("#notes").append("<h2 id='noteTitle'>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button type='button' class= 'saveNoteButton btn btn-default btn-danger' data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<button type='button' class= 'closeNoteButton btn btn-default' data-id='" + data._id + "' id='closenote'>Close</button>");
      $("#notes").append("<button type='button' class= 'deleteNoteButton btn btn-default btn-primary' data-id='" + data.note._id + "' id='deleteNote'>Delete Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

//route removes specific article from Articles.js Collection
$(document).on("click", ".deleteArticleButton", function(){
  
  var articleID = $(this).attr("data-id");
  $.ajax({
    method: "DELETE",
    url : "/deleteArticle/" + articleID
  }).then(function(data){
    console.log(data);
    // redirect to refresh with display articles path
    
  })
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//Button for closing a note if you don't want to save to db.
$(document).on("click", "#closenote", function () {
  $("#notes").empty();
})

// When you click the deleteNote button
$(document).on("click", "#deleteNote", function () {

  // Grab the id associated with the article from the submit button
  var noteID = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "DELETE",
    url: "/deleteNote/" + noteID,

  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });



  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
