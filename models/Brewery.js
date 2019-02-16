var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BrewerySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Brewery = mongoose.model("Brewery", BrewerySchema);

module.exports = Brewery;
