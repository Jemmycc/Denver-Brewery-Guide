
$(document).ready(function () {
    // Display unsaved breweries
    function displayUnsaved() {
        $(".breweries-scraped").empty();

        $.getJSON("/brewery/unsaved", function (data) {
            data.forEach(function (beer) {
                var card = $("<div>")
                    .addClass("card")
                    .attr({ "style": "18rem" });

                var title = $("<h5>")
                    .addClass("beer-title")
                    .text(beer.title);
                card.append(title);

                var cardBody = $("<div>")
                    .addClass("beer-text")
                    .text(beer.text);
                card.append(cardBody);

                var fullLink = "http://denverbreweryguide.com/" + beer.link;

                var link = $("<a>")
                    .addClass("beer-link").text(fullLink)
                    .addClass("beer-link").attr("href", fullLink);
                card.append(link);

                var btn = $("<input/>")
                    .addClass("save-btn")
                    .attr({ "data-_id": beer._id })
                    .attr({
                        type: "button",
                        id: "saveBtn",
                        value: "Save"
                    });
                card.append(btn);

                $(".breweries-scraped").append(card);
            });
        });
    }

    // Show the unsaved breweries when the home button is clicked
    $("#home-btn").on("click", function () {
        displayUnsaved();
    });

    // Show the unsaved breweries when the scrape button is clicked
    $("#scrape-btn").on("click", function () {
        $.ajax({
            method: "GET",
            url: "/brewery/scrape"
        }).then(function () {
            displayUnsaved();
        });
    });

    // Clear all brewery list
    $("#clear-btn").on("click", function () {
        $.ajax({
            method: "GET",
            url: "/brewery/clear"
        }).then(function (data) {
            console.log(data);
            window.location.assign("/");
        })
    });

    // Show the saved breweries when the save button is clicked
    $(document).on("click", ".save-btn", function () {
        var id = $(this).attr("data-_id");

        $.ajax({
            method: "GET",
            url: "/brewery/saved/" + id
        }).then(function () {
            displayUnsaved();
        });
    });

    // Return the saved brewery to the unsave
    $(document).on("click", ".unsave-btn", function () {
        var id = $(this).attr("data-_id");

        $.ajax({
            method: "GET",
            url: "/brewery/unsaved/" + id
        }).then(function (data) {
            console.log(data);
        }).then(function () {
            displaySaved();
        });
    });

    // Show the save breweries
    $("#saved-btn").on("click", function () {
        displaySaved();
    });

    // Display saved breweries
    function displaySaved() {
        $(".breweries-scraped").empty();

        $.getJSON("/brewery/saved", function (data) {
            data.forEach(function (beer) {
                var card = $("<div>")
                    .addClass("card")
                    .attr({ "style": "18rem" });

                var title = $("<h5>")
                    .addClass("beer-title")
                    .text(beer.title);
                card.append(title);

                var cardBody = $("<div>")
                    .addClass("beer-text")
                    .text(beer.text);
                card.append(cardBody);

                var fullLink = "http://denverbreweryguide.com/" + beer.link;

                var link = $("<a>")
                    .addClass("beer-link").text(fullLink)
                    .addClass("beer-link").attr("href", fullLink);
                card.append(link);

                var btn = $("<input/>")
                    .addClass("note-btn")
                    .attr({ "data-_id": beer._id })
                    .attr({ "data-beer": beer.title })
                    .attr({ "data-toggle": "modal" })
                    .attr({ "data-target": "#myModal" })
                    .attr({
                        type: "button",
                        id: "note-btn",
                        value: "Note"
                    });
                card.append(btn);

                btn = $("<input/>")
                    .addClass("unsave-btn")
                    .attr({ "data-_id": beer._id })
                    .attr({
                        type: "button",
                        id: "unsave-btn",
                        value: "Unsave"
                    });
                card.append(btn);

                $(".breweries-scraped").append(card);
            });
        });
    }

    // Show the note entry when the button is clicked
    $(document).on("click", ".note-btn", function () {
        var id = $(this).attr("data-_id");
        localStorage.beerId = id;

        var noteTitle = $(this).attr("data-beer");
        $(".modal-title").text(noteTitle);

        $.ajax({
            method: "GET",
            url: "/brewery/saved/note/" + id,
        }).then(function (data) {
            if (data.note) {
                $("#titleinput").val(data.note.title);
                $("#bodyinput").val(data.note.body);
                localStorage.noteId = data.note._id;
            }
            else {
                $("#titleinput").val('');
                $("#bodyinput").val('');
            }

            $("#myModal").modal();
        })
    })

    // Save a note about a brewery
    $("#savenote").on("click", function () {
        var title = $("#titleinput").val();
        var text = $("#bodyinput").val();

        if (title === "" && text === "") {
            return;
        }

        $.ajax({
            method: "POST",
            url: "/brewery/saved/note/" + localStorage.beerId,
            data: {
                title: title,
                body: text
            }
        })
            .then(function (data) {
                $('#notes-container').empty();
                $("#myModal").hide();
                localStorage.noteId = data.note;
            });
    })

    // Delete a brewery note
    $("#deletenote").on("click", function () {
        var title = $("#titleinput").val();
        var text = $("#bodyinput").val();

        if (title === "" && text === "") {
            return;
        }

        $.ajax({
            method: "DELETE",
            url: "/brewery/saved/note/" + localStorage.noteId
        })
            .then(function (data) {
                console.log(data);
            })
    })
});