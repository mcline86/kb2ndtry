var express        = require("express"),
    app            = express(),
    showdown       = require("showdown"),
    converter      = new showdown.Converter();
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

// app.configure(function() {
//   app.use(express.cookieParser('keyboard cat'));
//   app.use(express.session({ cookie: { maxAge: 60000 }}));
//   app.use(flash());
// });



app.get("/", function(req, res){
	kbDoc.find({}, function(err, docs){
		if(err){
			console.log(err);
		} else {
			res.render("index", {docs: docs});
		}
	});
});

app.get("/show/:id", function(req, res){
	kbDoc.findById(req.params.id, function(err, doc){
		if(err){
			console.log(err);
		} else {
			var html = converter.makeHtml(doc.body);
			res.render("show", {doc: doc, output: html});
		}
	});
});





//---------------------------------------------------
//         Admin Pages
//---------------------------------------------------

app.get("/admin", function(req, res){  //will display list of articles, orderby date
	kbDoc.find({}, function(err, docs){
		if(err){
			console.log("Error: " + err);
		} else {
			res.render("admin/index", {docs: docs});
		}
	});
});


//--------------------------------------------
//  kBase Doc    Create / Edit / Destroy
//--------------------------------------------

app.get("/admin/doc/new", function(req, res){  //nothing but markdown editor for creating pages
	res.render("admin/doc/newPage");
});

app.post("/admin/doc/new", function(req, res){
	kbDoc.create(req.body.doc, function(err, doc){
		if(err){
			console.log("Error: " + err);
		} else {
			res.redirect("/admin");
		}
	});
});


app.get("/admin/doc/:id", function(req, res){
	kbDoc.findById(req.params.id, function(err, doc){
		if(err){
			console.log("Error: " + err);
			res.redirect("/admin");
		} else {
			res.render("admin/doc/edit", {doc: doc});
		}
	});
});





//-----------------------------------------------------
//   Listen for incoming connections
//-----------------------------------------------------

app.listen("8080", "127.0.0.1", function(){
   console.log("The Server has Started!!");
});