
// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up a static folder (public) for our web app
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function (req, res) {
    res.render("index");
});

// Route for getting all breweries from the db
app.get("/brewery", function (req, res) {
    db.Brewery.find({})
        .then(function (dbBrewery) {
            res.json(dbBrewery);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// A GET route for scraping the web
app.get("/brewery/scrape", function (req, res) {
    db.Brewery.deleteMany({});

    axios.get("http://denverbreweryguide.com/breweries.aspx").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];

        $(".content").each(function (i, element) {
            // Save an empty result object
            var result = {};

            result.title = $(element)
                .find("h3")
                .text()
                .replace(/\s\s+/g, "");

            var txt = $(element).not($(element).children()).text().trim();
            var len = result.title.length;
            result.text = txt.substring(len).trim();

            result.link = $(element)
                .find("a")
                .attr("href");

            results.push(result);
        });
        // Create a new brewery using the "results" object built from scraping
        db.Brewery.create(results)
            .then(function () {
                res.send("scraped breweries");
            })
            .catch(function (err) {
                res.send(err);
            });
    });
});

// Save the selected brewery
app.get("/brewery/saved/:id", function (req, res) {
    db.Brewery.update({ _id: req.params.id }, { $set: { saved: true } }, function (err, saved) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            console.log(saved);
            res.send(saved);
        }
    });
});

// Unsave the selected brewery
app.get("/brewery/unsaved/:id", function (req, res) {
    db.Brewery.update({ _id: req.params.id }, { $set: { saved: false } }, function (err, saved) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            console.log(saved);
            res.send(saved);
        }
    });
});

// Return the saved breweries
app.get("/brewery/saved", function (req, res) {
    db.Brewery.find({ saved: true })
        .then(function (saved) {
            res.json(saved);
        })
        .catch(function (err) {
            res.send(err);
        });
});

// Return the unsaved breweries
app.get("/brewery/unsaved", function (req, res) {
    db.Brewery.find({ saved: false })
        .then(function (unsaved) {
            res.json(unsaved);
        })
        .catch(function (err) {
            res.send(err);
        });
});

// Clear the brewery list
app.get("/brewery/clear", function (req, res) {
    db.Brewery.deleteMany({}, function (err, deleted) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            console.log(deleted);
            res.send(deleted);
        }
    });
});

// Return the saved breweries
app.get("/brewery/saved/note", function (req, res) {
    db.Note.find({})
        .then(function (dbNote) {
            res.json(dbNote);
        })
        .catch(function (err) {
            res.send(err);
        });
});

// Route for grabbing a specific brewery by id, populate it with its note
app.get("/brewery/saved/note/:id", function (req, res) {
    db.Brewery.findOne({ _id: req.params.id })
        .populate({ path: "note" })
        .then(function (dbBrewery) {
            res.json(dbBrewery);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating a brewery's associated note
app.post("/brewery/saved/note/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created, find a brewery with an `_id` equal to `req.params.id`. Update the brewery to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User
            return (db.Brewery.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }));
        })
        .then(function (dbBrewery) {
            res.json(dbBrewery);
            console.log(dbBrewery);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// This route deletes a note by its specific ID and also removes the reference in the brewery
app.delete("/brewery/saved/note/:id", function (req, res) {
    console.log(req.params.id);
    // Remove the note itself
    db.Note.findOneAndRemove({ _id: req.params.id }, function (err, response) {
        if (err) throw err;
        // Now remove the note refererence from the brewery
        db.Brewery.updateOne(
            { "note": req.params.id },
            { "$unset": { "note": 1 } },
            function (err, res) {
                if (err) throw err;
            }
        );
    });
})

// Listen on port 3000
app.listen(PORT, function () {
    console.log(`App running on port ${PORT}!`);
});
