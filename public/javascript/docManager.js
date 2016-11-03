var docArray = [];
var catArray = [];
var dBody;
var numToDisplay = 10;
var displayArray = [10, 20, 30];
var pageNum = 1;

var simplemde = new SimpleMDE ({ 
    element: $("#newDocArea")[0]
});
    
var editMde = new SimpleMDE ({         
    autofocus: true,
    element: $("#editDocArea")[0],
    forceSync: true
});  


//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//     ajax call to gather categories, then fills select elements
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

$.ajax({
        url: "/api/cat"
    }).done( function (data) {
        catArray = data;
        catArray.forEach ( function (cat) {
            console.log("CatArray: " + cat.name + " - added");
            var tmp = document.createElement('option');
            $(tmp).val(cat._id);
            $(tmp).html(cat.name);            
            $('#newDoc_form').find('select').append(tmp.cloneNode(true));
            $('.edSelect').append(tmp.cloneNode(true));
        });
    });




//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//  Events triggered when Edit Modal is opened
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

$('#editDocModal').on("show.bs.modal", function (e) {
   var docID = $(e.relatedTarget).data('docid');
    $.ajax({
        url: "/api/doc/" + docID
    }).done( function (data) {
        $('#editDoc_form').find('.titleInput').val(data.title);
        $('#editDoc_form').find('.metaInput').val(data.meta);
        dBody = data.body;
        console.log("Update Value");
        $('#editDocArea').focus();
        $('#editDoc_form').find('select').val(data.category);
        $("#editDoc_form").attr('action', "/admin/doc/"+data._id+"?_method=PUT");
        $('#edDelete').attr('action', "/admin/doc/delete/"+data._id+"?_method=DELETE");
    });        
});

$('#editDocModal').on('shown.bs.modal', function () {
    console.log("refresh");
    editMde.value(dBody);
});

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------
//   Ajax call to gather documents, pagination handling etc
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

$.ajax( {
    url: "/api/doc"
}).done( function (data) {
    docArray = data;
    buildTable(1);
});

function buildTable (page) {
    var table = document.createElement('table');
    table.className = 'table table-hover';
    var thead = document.createElement('thead');
    $(thead).append("<tr><th>#</th><th width='85%'>Title</th><th>Created</th></tr>");
    $(table).append(thead);
    
    var start = (page - 1) * numToDisplay;
    var tbody = document.createElement('tbody');
    for( var i = start; i < start + numToDisplay; i++) {
        if (docArray.length > i) {
            var tr = "<tr><td>" + (i+1) + "</td>";
            tr += "<td><a href='#' data-toggle='modal' data-target='#editDocModal' class='docEditLink' data-docID='" + docArray[i]._id + "'>" + docArray[i].title + "</a></td>";
            tr += "<td>" + moment(docArray[i].created).format("MM/DD/YYYY") + "</td></tr>";
            $(tbody).append(tr);
            $('.panel-body').html(table);
        }
    }
    $(table).append(tbody);
    
    buildPagination(page);
}

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//    Build Pagination based on page number
//--------------------------------------------------------------------
//--------------------------------------------------------------------

function buildPagination (page) {
    var total = docArray.length;
    var ul = $('.pagination')
    if (page == 1) {
        ul.html("<li class='page-item disabled'><span class='page-link'>&laquo;</span></li>");
        
    } else {
        ul.html("<li class='page-item'><a href='#' data-index='" + (page - 1) + "' class='page-link'>&laquo;</a></li>");
    }
    
    var pageCount = total / numToDisplay;
    if (total % numToDisplay > 0) pageCount++;
    for (var i = 1; i <= pageCount; i++) {
        if( i == page ) {
            ul.append("<li class='page-item active'><span class='page-link'>" + i + "</span></li>");
        } else {
            ul.append("<li class='page-item'><a href='#' data-index='" + i + "' class='page-link'>" + i + "</a></li>");
        }        
    }
    if (parseInt(pageCount) > 1) {
        ul.append("<li class='page-item'><a href='#' data-index='" + (page + 1) + "' class='page-link'>&raquo;</a></li>")
    }
}

$('ul.pagination').on('click', 'a.page-link', function (e) {    
    var index = $(this).data('index');
    buildTable(index);
});