var express        = require("express"),
    app            = express(),
    showdown       = require("showdown"),
    converter      = new showdown.Converter(),
    mongoose       = require('mongoose'),
    Category       = require("./models/category"),
    kbDoc          = require("./models/document"),
    bodyParser     = require("body-parser"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override");


mongoose.connect("mongodb://mcline:pass1295@ds057176.mlab.com:57176/hclkbase");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret: "If you can read this, you shouldn't be here and you know it. . .",// Not you Michael...your cool
    resave: false,
    saveUninitialized: false
}));

app.use(flash());


app.use(function(req, res, next){   //create variables passed to every page
   //res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.info = req.flash("info");
   next();
});


app.get("/", function (req, res) {
	kbDoc.find({}, function (err, docs) {
		if (err) {
			console.log(err);
            req.flash("error", err);
            res.redirect("/");
		} else {
			res.render("index", {docs: docs});
		}
	});
});

app.get("/show/:id", function (req, res) {
	kbDoc.findById(req.params.id, function (err, doc) {
		if (err) {
			console.log(err);
            req.flash("error", err);
            res.redirect("/");
		} else {
            doc.views += 1;
            doc.save();
			var html = converter.makeHtml(doc.body);
            Category.find({}, function (err, cats) {
               if (err) {
                   console.log(err);
                   req.flash("error", err);
                   res.redirect("/");
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
          req.flash("error", err);
          res.redirect("/");
      } else {
          kbDoc.find({category: req.params.id}, function (err, docs) {
             if (err) {
                 console.log(err);
                 req.flash("error", err);
                 res.redirect("/");
             } else {
                 res.render('catShow', {cats: cats, docs: docs, current: req.params.id});
             }
          });
      }
   }); 
});

app.get("/categories", function (req, res) {
   Category.find({}, function (err, cats) {
      if(err) {
          req.flash("error", err);
          res.redirect("/");
      } else {
          
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
            req.flash("error", err);
            res.redirect("/admin");
		} else {
            Category.find({}, function (err, cats) {
                if (err) {
                    req.flash("error", err.toString());
                    res.redirect("back");
                } else {
                    res.render("admin/index", {docs: docs, cats: cats});
                }
            });
			
		}
	});
});


//--------------------------------------------
//  kBase Doc    Create / Edit / Destroy
//--------------------------------------------

app.get("/admin/doc", function (req, res) { 
    kbDoc.find({}, function (err, docs) {
		if (err) {
			console.log("Error: " + err);
            req.flash("error", err);
            res.redirect("/admin/doc");
		} else {
			res.render("admin/doc/index", {docs: docs});
		}
	});
});

app.get("/admin/doc/new", function (req, res) {  //nothing but markdown editor for creating pages
	Category.find({}, function (err, cats) {
        if (err) {
            console.log("error")
            req.flash("error", err);
            res.redirect("/admin");
        } else {
            res.render("admin/doc/newPage", {cats: cats});
        }
    });
});

app.post("/admin/doc/new", function (req, res) {
	kbDoc.create(req.body.doc, function (err, doc) {
		if (err) {
			console.log("Error: " + err);
            req.flash("error", err.toString());
            res.redirect("/admin");
		} else {
            req.flash("info", "New Document was successfully created. Good Job!!");
			res.redirect("/admin");
		}
	});
});


app.get("/admin/doc/:id", function (req, res) {
	kbDoc.findById(req.params.id, function (err, doc) {
		if (err) {
			console.log("Error: " + err);
			req.flash("error", err.toString());
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
            req.flash("error", err.toString());
            res.redirect("/admin");
		} else {
            req.flash("info", "Your document has been updated, please choose another to edit.")
			res.redirect("/admin/doc");
		}
	});
});

app.delete("/admin/doc/delete/:id", function (req, res) {
    kbDoc.findByIdAndRemove(req.params.id, function (err) {
       if (err) {
          req.flash("error", err.toString());
           res.redirect("/admin/doc");
       } else {
           req.flash("info", "Document has been deleted, Thank You");
           res.redirect("/admin/doc");
       }
    });
});

//-------------------------------------------
//  API Routes
//-------------------------------------------



app.get("/api/doc", function (req, res, next) {
   kbDoc.find({}, function(err, docs){
      if(err) return next(err);
       res.json(docs);
   }); 
});

app.get("/api/doc/:id", function(req, res, next){
   kbDoc.findById(req.params.id, function(err, doc){
      if(err) return next(err);
       res.json(doc);
   }); 
});

app.get("/api/cat", function(req, res,next){
   Category.find({}, function(err, cats){
      if(err) return next(err);
       res.json(cats);
   }); 
});

app.get("/api/cat/:id", function(req, res, next){
   Category.findById(req.params.id, function(err, cat){
      if(err) return next(err);
       res.json(cat);
   }); 
});

//--------------------------------------------
//  kBase Category Create / Edit / Destroy
//--------------------------------------------

app.get("/admin/cat", function (req, res) {
   Category.find({}, function (err, cats) {
      if (err) {
          console.log("Error: " + err);
          req.flash("error", err.toString());
            res.redirect("/admin");
      } else {
          res.render("admin/cat/index", {cats: cats});
      }
   });
});

app.post("/admin/cat/new", function (req, res) {
   Category.create(req.body.cat, function (err, cat) {
      if (err) {
          console.log("Error: " + err);
          req.flash("error", err.toString());
            res.redirect("/admin/cat");
      } else {
          req.flash("info", "New Category has been created, hooray!");
          res.redirect("/admin/cat");
      }
   }); 
});

app.put("/admin/cat/:id", function (req, res) {
   Category.findByIdAndUpdate(req.params.id, req.body.cat, function (err, cat) {
      if (err) {
          console.log("Error: " + err);
          req.flash("error", err.toString());
            res.redirect("/admin/cat");
      } else {
          req.flash("info", "Category has been updated, Thank you that was begining to bother me. . . ");
          res.redirect("/admin/cat");
      }
   }); 
});

app.delete("/admin/cat/:id", function (req, res) {
   Category.findByIdAndRemove(req.params.id, function(err) {
      if(err) {
          req.flash("error", err.toString());
          res.redirect("/admin/cat");
      } else {
          req.flash("info", "Category was successfully removed. Thank you.");
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