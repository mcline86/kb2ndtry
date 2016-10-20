var express        = require("express"),
    app            = express(),
    showdown       = require("showdown"),
    converter      = new showdown.Converter(),
    mongoose       = require('mongoose'),
    Category       = require("./models/category"),
    kbDoc          = require("./models/document"),
    bodyParser     = require("body-parser"),
    flash          = require("connect-flash"),
    methodOverride = require("method-override");


mongoose.connect("mongodb://mcline:pass1295@ds057176.mlab.com:57176/hclkbase");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"));



app.get("/", function (req, res) {
	kbDoc.find({}, function (err, docs) {
		if (err) {
			console.log(err);
		} else {
			res.render("index", {docs: docs});
		}
	});
});

app.get("/show/:id", function (req, res) {
	kbDoc.findById(req.params.id, function (err, doc) {
		if (err) {
			console.log(err);
		} else {
			var html = converter.makeHtml(doc.body);
            Category.find({}, function (err, cats) {
               if (err) {
                   console.log(err);
               } else {
                   res.render("show", {doc: doc, output: html, cats: cats});
               }
            });            
			
		}
	});
});

app.get("/show/cat/:id", function (req, res) {
   Category.find({}, function (err, cats) {
      if (err) {
          console.log(err);
      } else {
          kbDoc.find({category: req.params.id}, function (err, docs) {
             if (err) {
                 console.log(err);
             } else {
                 res.render('catShow', {cats: cats, docs: docs, current: req.params.id});
             }
          });
      }
   }); 
});

//---------------------------------------------------
//         Admin Pages
//---------------------------------------------------

app.get("/admin", function (req, res) {  //will display list of articles, orderby date
	kbDoc.find({}, function (err, docs) {
		if (err) {
			console.log("Error: " + err);
		} else {
			res.render("admin/index", {docs: docs});
		}
	});
});


//--------------------------------------------
//  kBase Doc    Create / Edit / Destroy
//--------------------------------------------

app.get("/admin/doc/new", function (req, res) {  //nothing but markdown editor for creating pages
	Category.find({}, function (err, cats) {
        if (err) {
            console.log("error")
        } else {
            res.render("admin/doc/newPage", {cats: cats});
        }
    });
});

app.post("/admin/doc/new", function (req, res) {
	kbDoc.create(req.body.doc, function (err, doc) {
		if (err) {
			console.log("Error: " + err);
		} else {
			res.redirect("/admin");
		}
	});
});


app.get("/admin/doc/:id", function (req, res) {
	kbDoc.findById(req.params.id, function (err, doc) {
		if (err) {
			console.log("Error: " + err);
			res.redirect("/admin");
		} else {
            Category.find({}, function (err, cats) {
               if (err) {
                   console.log(err);
               } else {
                   res.render("admin/doc/edit", {doc: doc, cats: cats});
               }
            });			
		}
	});
});

app.put("/admin/doc/:id", function (req, res) {
	kbDoc.findByIdAndUpdate(req.params.id, req.body.doc, function (err, doc) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/admin");
		}
	});
});


//--------------------------------------------
//  kBase Category Create / Edit / Destroy
//--------------------------------------------

app.get("/admin/cat", function (req, res) {
   Category.find({}, function (err, cats) {
      if (err) {
          console.log("Error: " + err);
      } else {
          res.render("admin/cat/index", {cats: cats});
      }
   });
});

app.post("/admin/cat/new", function (req, res) {
   Category.create(req.body.cat, function (err, cat) {
      if (err) {
          console.log("Error: " + err);
      } else {
          res.redirect("/admin/cat");
      }
   }); 
});

app.put("/admin/cat/:id", function (req, res) {
   Category.findByIdAndUpdate(req.params.id, req.body.cat, function (err, cat) {
      if (err) {
          console.log("Error: " + err);
      } else {
          res.redirect("/admin/cat");
      }
   }); 
});


//-----------------------------------------------------
//   Listen for incoming connections
//-----------------------------------------------------

app.listen("8080", "127.0.0.1", function () {
   console.log("The Server has Started!!");
});