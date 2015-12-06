/* The concordance table and the tables on the archive pages work basically in the same way. Differences:
 *
 * (1) The concordance table contains a repository column that is unneeded for the others
 * (2) Each archive detail page contains only the documents from that archive
 */


var createConcordanceTable = function createConcordanceTable(container, repository) {
  // remove test and the texts from the other repositories
  documentMetadata.metadata = documentMetadata.metadata.filter(function(metadata) {
    return metadata.text !== "test.xml" && 
      (!repository || metadata.sigils.repository === repository)
  });
  // Map document metadata into format for table
  var concordanceTableData = documentMetadata.metadata.map((function(){
    return function(metadata){
      var i, j;
      var tableElementData = [];
      var firstSigil;
      // for each element in document metadata iterate through all concordance columns and write data
      // from metadata if it is part of one of the concordance colimns
      for(i = 0; i < concordanceColumns.length; i++) {
	var tableElementColumnData = {};
	tableElementColumnData.text = "";

	// marker to find out if the current concordance column field contains more than one sigil.
	firstSigil = true;
	// iterate through each sigil that will make up the data for the current concordance column
	for(j = 0; j < concordanceColumns[i].sigils.length; j++) {
	  // current sigil found in document's metadata
	  if(metadata.sigils[concordanceColumns[i].sigils[j]]) {
	    // if there are more than one sigil in the document for the current column separate
	    // all sigils with ", "
	    if(firstSigil) {
	      firstSigil = false;
	    } else {
	      tableElementColumnData.text = tableElementColumnData.text + ", ";
	    }

	    // Now write the actual sigil value from document metadata to concordance table. If the current column is
	    // "repository", than replace the sigil with it's textual representation (archive displayName)
	    if(concordanceColumns[i].sigils[j] === "repository" && archives[metadata.sigils[concordanceColumns[i].sigils[j]]]) {
	      tableElementColumnData.text = tableElementColumnData.text + archives[metadata.sigils[concordanceColumns[i].sigils[j]]].displayName;
	      tableElementColumnData["displayName"] = archives[metadata.sigils[concordanceColumns[i].sigils[j]]].displayName;
	    } else {
	      // if the sigil isn't "repository" write it to the result string for the current column.
	      // if the value of the current sigil equals "none" or "n.s." than mute the output. otherwise write sigil.
	      if( ( metadata.sigils[concordanceColumns[i].sigils[j]] !== "none" ) && ( metadata.sigils[concordanceColumns[i].sigils[j]] !== "n.s." ) ) {
		// next condition: sigil idno_gsa_1 may only be written, if the attached repository is gsa. otherwise mute output of idno_gsa_1 sigil
		if( !( (concordanceColumns[i].sigils[j] === "idno_gsa_1") && !(metadata.sigils["repository"] === "gsa") ) ) {
		  tableElementColumnData.text = tableElementColumnData.text + metadata.sigils[concordanceColumns[i].sigils[j]];
		}
	      }
	    }
	    tableElementColumnData[concordanceColumns[i].sigils[j]] = metadata.sigils[concordanceColumns[i].sigils[j]];
	  }
	} 
	tableElementData.push(tableElementColumnData);
      };

      // store faustUri for adding link to table row later on:
      tableElementData.faustUri = "faust://xml/document/" + metadata.document;

      tableElementData.isPrint = metadata.type === "print";

      // handle print witnesses
      if(tableElementData.isPrint) {
	var textTranscriptName = metadata.text.substr(0, metadata.text.lastIndexOf("."));
	// XXX this shouldn't be hard-coded
	tableElementData.printResourceName = {"A8_IIIB18": "A8_IIIB18.html", "B9_IIIB20-2": "B9_IIIB20-2.html", "Ba9_A101286": "Ba9_A101286.html", "C(1)12_IIIB23-1": "C(1)12_IIIB23-1.html", "C(1)4_IIIB24": "C(1)4_IIIB24.html", "C(2a)4_IIIB28": "C(2a)4_IIIB28.html", "C(3)12_IIIB27": "C(3)12_IIIB27.html", "C(3)4_IIIB27_chartUngleich": "C(3)4_IIIB27_chartUngleich.html", "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I": "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I.html", "D(1)_IV3-1": "D(1)_IV3-1.html", "D(2)_IV3-6": "D(2)_IV3-6.html", "GSA_30-447-1_S_214-217": "GSA_30-447-1_S_214-217.html", "GSA_32_1420": "GSA_32_1420.html", "J_XIIA149-1808": "J_XIIA149-1808.html", "KuA_IIIE43-5-1": "KuA_IIIE43-5-1.html", "S(o)_IIIB11-2": "S(o)_IIIB11-2.html"}[textTranscriptName];
      }
      return tableElementData;
    };
  })());

  concordanceManuscriptTableData = concordanceTableData.filter(function(tableData) {return !tableData.isPrint;});
  concordancePrintTableData = concordanceTableData.filter(function(tableData) {return tableData.isPrint;});

  var concordanceTableContainer = container;

  // create event listener to sort columns
  var sortClickEventListener = (function(tableData, concordanceColumns, parentElement) {
    var currentColumn;
    var currentSort = 0;
    var sortMethods = ["sigil", "descSigil"];

    var sortedTableData;
    var tableDiv;

    var eventListener = function(event) {
      // determine sort direction 
      if(event && currentColumn === this.cellIndex && currentSort === 0) {
	currentSort = 1;
      } else {
	currentSort = 0;
      }

      // store clicked cell index. if no cellIndex exists (function called directly; not als eventHandler) set default sort direction and column
      // test if cellIndex is an integer
      if(this.cellIndex === parseInt(this.cellIndex, 10)) {
	currentColumn = parseInt(this.cellIndex);
      }
      // if currentColumn is not an integer (i.e. undefined) set default column
      if(!(currentColumn === parseInt(currentColumn, 10))) {
	currentColumn = 0;
      }

      // add new Table. first sort data, then generate table, last remove all parent children and add new table
      sortedTableData = Faust.sort(tableData, sortMethods[currentSort], currentColumn + ".text");

      tableDiv = createConcordanceTable(concordanceColumns, sortedTableData);
      tableDiv.getElementsByTagName("th")[currentColumn].className = "pure-nowrap pure-col-sorted pure-sortable";

      if(currentSort === 0) {
	tableDiv.getElementsByTagName("th")[currentColumn].firstElementChild.className = "fa fa-sort-asc pure-pull-right";
      } else if (currentSort === 1) {
	tableDiv.getElementsByTagName("th")[currentColumn].firstElementChild.className = "fa fa-sort-desc pure-pull-right";
      }

      while(parentElement.firstChild) {
	parentElement.removeChild(parentElement.firstChild);
      }

      parentElement.appendChild(tableDiv);

      // set scrollTop to 0 so that the table begin is shown.
      parentElement.scrollTop = 0;

    }

    eventListener.setData = function(newTableData) {
      tableData = newTableData; 
      eventListener();
    };

    return eventListener;
  })(concordanceTableData, concordanceColumns, concordanceTableContainer);

  // create function for table generation
  var createConcordanceTable = (function() {
    return function(concordanceColumns, concordanceData) {
      var span;
      var i, j;

      var currentDocument;

      var concordanceTable = document.createElement("table");
      concordanceTable.id = "concordanceTable";
      concordanceTable.className = "pure-table";

      var tableHead = document.createElement("thead");
      var tableRow = document.createElement("tr");

      // create table header row
      for(i = 0; i < concordanceColumns.length; i++) {
	var tableData = document.createElement("th");
	tableData.className = "pure-nowrap pure-sortable";
	tableData.addEventListener("click", sortClickEventListener);

	var span = document.createElement("i");
	span.className = "fa fa-sort pure-pull-right pure-fade-20";
	tableData.appendChild(span);

	tableData.appendChild(document.createTextNode(concordanceColumns[i].column));

	tableRow.appendChild(tableData);
      }
      tableHead.appendChild(tableRow);
      concordanceTable.appendChild(tableHead);

      var tableBody = document.createElement("tbody");

      // create rows for each column
      concordanceData.forEach(function(currentDocument, documentIndex) {
	tableRow = document.createElement("tr");
	if(currentDocument.isPrint) {
	  // tableRow.addEventListener("click", function(){window.location = "print/" + currentDocument.printResourceName;});
	  var documentLink = "print/" + currentDocument.printResourceName;
	} else {
	  // tableRow.addEventListener("click", function(){window.location = "documentViewer.php?faustUri=" + currentDocument.faustUri;});
	  var documentLink = "documentViewer.php?faustUri=" + currentDocument.faustUri;
	}

	concordanceColumns.forEach(function(currentColumn, columnIndex) {
	  tableData = document.createElement("td");
	  if (columnIndex == 0) {
	    var tableDataLink = document.createElement("a");
	    tableDataLink.href = documentLink;
	    tableDataLink.appendChild(document.createTextNode(concordanceData[documentIndex][columnIndex].text));
	    tableData.appendChild(tableDataLink);
	  } else {
	    tableData.appendChild(document.createTextNode(concordanceData[documentIndex][columnIndex].text));
	  }
	  tableRow.appendChild(tableData);
	});
	tableBody.appendChild(tableRow);
      });
      concordanceTable.appendChild(tableBody);

      return concordanceTable;
    };
  })();

  sortClickEventListener.setData(concordanceManuscriptTableData); // initialize function
}
