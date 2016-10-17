var mongoose = require("mongoose");

var catSchema = new mongoose.Schema({
        name: String,
        parent: {    //Parent Category or null if is a top level category
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        docs: [         //Array of documents in this category
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Document"
                }
            ]
        
});

module.exports = mongoose.model("Category", catSchema);