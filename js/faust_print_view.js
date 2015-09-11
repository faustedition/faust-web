//function to load generated html of transcripts
var createPrintDiv = (function() {
  "use strict";

  var pages;
  var printDiv;

  // function to load html and generate a div that will be returned
  var getPrintDocument = function(printPath, faustUri, callback) {
    var page;
    var printFilename;

    // only load html and generate div if not already done before
    if(printDiv === undefined) {
      // get metadata for requested document
      page = pages[faustUri];
      var splitted = false;
      // find out if there is only one generate for the document
      Object.keys(page).forEach(function(key) {
        if(printFilename === undefined) {
          printFilename = page[key];
        }
        if(printFilename !== page[key]) {
          splitted = true;
        }
      });

      // if multiple generates exists, load the combined html file
      // XXX why?
      if(splitted) {
        printFilename = printFilename.replace(/(\.\d+)?\.html$/, ".all.html");
      }

      // get selected file
      Faust.xhr.getResponseText(printPath + printFilename, function(printHtml) {
        // create container element for the text and add print class to it
        var printParentNode = document.createElement("div");
        printParentNode.className = "print";

        // create temporary div to parse received html and adjust paths to resources
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = printHtml.replace(/\.\.\//g, "");
        
        // add contents of parsed html to container element and hide rightmost column
        Array.prototype.slice.call(tempDiv.getElementsByClassName("print")[0].childNodes).forEach(function(child) {
          if(child.className === "print-side-column") {
            child.style.visibility = "hidden";
          }
          printParentNode.appendChild(child);
        });

        // store result in printDiv
        printDiv = printParentNode;

        // return a copy of the created div to caller
        callback(printDiv.cloneNode(true));
      });
    } else {
      // return a copy of the cached div if the div was created before
      callback(printDiv.cloneNode(true));
    }
  };

  // actual function that will be returned. printPath is the relative path to the
  // directory containing the html generates, pagesFilename the name of the metadata file
  // containing information on the generates, faustUri the faustUri of the document.
  // Callback will be called with a parameter containing a div that holds the generate contents
  return function(printPath, pagesFilename, faustUri, callback) {
    // load metadata file if not already done
    if(pages === undefined) {
      Faust.xhr.getResponseText(printPath + pagesFilename, function(pagesJson) {

        // parse file ...
        pages = JSON.parse(pagesJson);
        // and try to get requested html
        getPrintDocument(printPath, faustUri, callback);
      });
    } else {
      getPrintDocument(printPath, faustUri, callback);
    }
  };
})();
