    //Global variables for cp
    
    var docArray = [];
    var catArray = [];
    var recentDocs = [];
    var topCats = [];
    
$(document).ready(function(){
        
    //Copy docData table into docArray
    $('tr.docData').each(function () {                
        var tmpDoc = {
            title    : $(this).find(".docTitle").html(),
            _id      : $(this).find(".docID").html(),
            created  : $(this).find(".docDate").html(),
            helpful  : parseInt($(this).find(".docHelp").html()),
            views    : parseInt($(this).find(".docViews").html()),
            category : $(this).find(".docCat").html()
        };
        docArray.push(tmpDoc);
    });
    
    //Copy catData Table into catArray
    $('tr.catData').each(function () {        
       var tmpCat = {
           _id    : $(this).find('.cID').html(),
           name   : $(this).find('.cName').html(),
           parent : $(this).find('.cParent').html()
       };
        catArray.push(tmpCat);
    });
	
    var totViews = 0;
    docArray.forEach(function(doc) {
       totViews += doc.views; 
    });
    
    
    
    
    //Build recent Document Array
    docArray.forEach( function(doc) {
       var  date = moment();
        console.log(date.diff(doc.created, "day"));
        if(recentDocs.length > 0){
            var inserted = false;
            recentDocs.forEach( function (d, index) {                
                if(!inserted && date.diff(d.created, "day") > date.diff(doc.created, "day")){
                    recentDocs.splice(index, 0, doc);                    
                    inserted = true;
                }
            });
            if(!inserted && recentDocs.length < 10) { recentDocs.push(doc); }
        } else {
            recentDocs.push(doc);
        }
    });
    
    
    
    catArray.forEach( function (cat) {
       var inserted = false;
       if (topCats.length > 0) {
           topCats.forEach( function(tCat, index) {
               if (!inserted) {
                   if (docsInCat(cat._id) > docsInCat(tCat._id)) {
                        topCats.splice(index, 0, cat);
                       inserted = true;
                   }
               }
           });
       } else {
           topCats.push(cat);
           inserted = true;
           
       }
        if(!inserted && topCats.length < 10){ topCats.push(cat);}
    });
    
    function displayCats () {
        topCats.forEach( function(cat, index) {
            if (index < 10) {
                var row = "<tr><td>" + cat.name + "</td><td class='text-center'>" + docsInCat(cat._id) + "</td></tr>";
                $('#topCats table').append(row);
            }
        });
    }
    
    $(document).ready(function () { //code in this callback will be called after everything above has finished
        
        $('#totDocs').find('.panel-body').html(docArray.length);
        $('#totCats').find('.panel-body').html(catArray.length);
        $('#totViews').find('.panel-body').html(totViews);
        displayRecent();
        displayCats();
    });
});
    
    function displayRecent (){
        recentDocs.forEach( function(rDoc, index) {
           if (index < 10) {
               var tdS = "<td>";
               var tdE = "</td>";
               var tmp = "<tr>" + tdS + rDoc.title.substring(0,15) + "..." + tdE;
               tmp += tdS + rDoc.views + tdE;
               if (rDoc.helpful) { 
                   tmp += tdS + rDoc.helpful + tdE;
               } else {
                   tmp += tdS + " " + tdE;
               }
               tmp += tdS + moment(rDoc.created).format("MM/DD/YYYY") + tdE + "</tr>";
              $('#recentDocs table').append(tmp); 
           } 
        });
    }
    
    function docsInCat (catID) {
        var count = 0;
        docArray.forEach( function (doc) {
            if(String(doc.category) == String(catID)){
                count++;                
            }            
        });
        return count;
    }
