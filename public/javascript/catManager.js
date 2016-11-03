var catArray = [];

var numToDisplay = 10;

var displayArray = [
    10, 20, 30
];

var pageNum = 1;

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Ajax call to gather Category Data, store in catArray
//--------------------------------------------------------------------
//--------------------------------------------------------------------


$.ajax ( {
    url: "/api/cat"
}).done( function (data) {
    catArray = data;
    buildTable(1);
    fillSelect();
});

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Fill select elements with categories
//--------------------------------------------------------------------
//--------------------------------------------------------------------

function fillSelect(){
    catArray.forEach ( function (cat) {
       var tmp = "<option value='" + cat._id + "'>" + cat.name + "</option>";
        $('#edParent').append(tmp);
        $('#newParent').append(tmp);
    });
}


//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Build Table based on page number
//--------------------------------------------------------------------
//--------------------------------------------------------------------

function buildTable (page) {
    var table = document.createElement('table');
    table.className = "table table-hover";
    var thead = document.createElement('thead');
    $(thead).append("<tr><th>#</th><th width='65%'>Name</th><th width='20%'>Category ID</th><th width='10%'>Parent</th>");
    $(table).append(thead);
    
    var start = (page - 1) * numToDisplay;
    var tbody = document.createElement('tbody');
    for (var i = start; i < start + numToDisplay; i++) {
        if (i < catArray.length) {
            var tmp = "<tr><td>" + (i+1) + "</td><td>";
            tmp += "<a href='#' data-myid='" + catArray[i]._id + "' data-toggle='modal' data-target='#editCat'>" + catArray[i].name + "</a></td>";

            tmp += "<td>" + catArray[i]._id + "</td>";
            tmp += "<td>" + getParent(catArray[i].parent) + "</td></tr>";
            $(tbody).append(tmp);
        }
    }
    $(table).append(tbody);
    $('.panel-body').html(table);
    buildPagination(page);
}

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Build Pagination based on page number
//--------------------------------------------------------------------
//--------------------------------------------------------------------

function buildPagination (page) {
    var total = catArray.length;
    var ul = $('.pagination')
    if (page == 1) {
        ul.html("<li class='page-item disabled'><span class='page-link'>&laquo;</span></li>");
        
    } else {
        ul.html("<li class='page-item'><a href='#' data-index='" + (page - 1) + "' class='page-link'>&laquo;</a></li>");
    }
    
    var pageCount = (total / numToDisplay);
    if (total % numToDisplay > 0) pageCount++;
    for (var i = 1; i <= pageCount; i++) {
        if( i == page ) {
            ul.append("<li class='page-item active'><span class='page-link'>" + i + "</span></li>");
        } else {
            ul.append("<li class='page-item'><a href='#' data-index='" + i + "' class='page-link'>" + i + "</a></li>");
        }        
    }
    if (parseInt(pageCount) > 1) {
        ul.append("<li class='page-item'><a href='#' class='page-link' data-index='" + (page + 1) + "'>&raquo;</a></li>")
    }
}

$('ul.pagination').on('click', 'a.page-link', function (e) {    
    var index = $(this).data('index');
    buildTable(index);
});


//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Function to look up parent based on ID
//--------------------------------------------------------------------
//--------------------------------------------------------------------

function getParent (pID) {
    var tmp = "";
    if(pID) {
       catArray.forEach( function (cat) {
           if (cat._id.toString() == pID.toString()) {
              tmp = "<span class='label label-success'> " + cat.name + "  </span>";
           }
       });
    }  else {
         return "<span class='label label-default'> Global </span>";
    }
    
    if (tmp == "") {
        return "<span class='label label-danger'> Error </span>";
    } else {
        return tmp;
    }    
}

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Event triggered when editCat Modal is displayed
//--------------------------------------------------------------------
//--------------------------------------------------------------------

$('#editCat').on('show.bs.modal', function (event) {
        console.log("Opened Edit window!!");
        var button = $(event.relatedTarget);        
        var catID = button.data('myid');
      
        var tmpCat;
        catArray.forEach ( function (cat) {
            if(cat._id.toString() == catID) {
                console.log("Found Cat Info");
                tmpCat = cat;
            }
        });   
        console.log(tmpCat);
        $(this).find('form').attr('action', "/admin/cat/" + catID + "?_method=PUT");
        $('#catDelete').attr('action', "/admin/cat/" + catID + "?_method=DELETE");
        $('#edCatName').val(tmpCat.name);
        $('#edParent').val(tmpCat.parent);
    });
    
//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    do not send parent field if empty (temporary bug fix)
//--------------------------------------------------------------------
//--------------------------------------------------------------------

$('#editCat form').submit(function() {
    if($('#edParent').val() === "" || $('#edParent').val() === undefined) {
        $('#edParent').removeAttr('name');
    }
});