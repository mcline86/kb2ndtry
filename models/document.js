var mongoose = require("mongoose");

var docSchema = new mongoose.Schema({
    title   : String,
    meta    : String,
    category: {    //ref to category object this doc belongs too
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
    created : { type: Date, default: Date.now },
    updated : Date,
    views   : { type: Number, default: 0 },
    helpful : { type: Number, default: 0 },
    body    : String 
});

module.exports = mongoose.model("Document", docSchema);