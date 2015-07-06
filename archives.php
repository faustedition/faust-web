      <?php include "includes/header.php"; ?>
        <style>









          .flex-container {
            width: 100%;
/*            display: flex;*/
            display: none;
            flex-wrap: wrap;
            justify-content: space-around;
          }

          .flex-child {
            border: 1px solid black;
            flex: 1 2 auto;
            flex-shrink: 2;
            white-space: nowrap;
            width: 25em;
            box-sizing: content-box;
            margin:   0.75em 0.75em;
            padding: 0em 1em 1em 1em;
            border-radius: 1em;
            position: relative;
          }

          .flex-child > a {
            position: absolute;
            top: 0px;
            left: 0px;
            height: 100%;
            width: 100%;
          }

          .flex-child:hover {
            background-color: rgba(255, 200, 175, 0.25);
          }







          .concordance-table {
            border-collapse: collapse;
            width: 100%;
            margin: auto;
          }

          .concordance-table-header {
            font-weight: bold;
          }

          .concordance-table-header th {
            font-weight: bold;
            border-style: solid;
            border-color: black;
            border-width: 0px 1px 3px 0px;
          }

          .concordance-table-header-sorted-column {
            background-color: #FFC20E;
          }
          
          tr:hover {
            background-color: rgba(255, 200, 175, 0.25);
          }

          td {
            padding: 0.1em 0.25em;
            border: 1px solid black;
            white-space: nowrap;
            cursor: pointer;
          }

          .concordance-table-container{
            height: 100%;
            width: 100%;
            border: 1px solid black;
            overflow: auto;
/*            display: none;*/
          }






.main-content-container {
  width: 100%;
  height: 100%;
  padding: 0.5em 0.5em 2.5em 0.5em;
  overflow: auto;
}

.main-content {
  border: 1px solid black;
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 0.5em;
}

.navigation-button {
  background-color: rgba(255, 200, 175, 0.5);
}




        </style>

        <div id="main-content" class="main-content">
          <div id="concordance-table-container" class="concordance-table-container">
          </div>
          <div id="flex-container" class="flex-container">
          </div>
        </div>
        <div id="navigation-bar-container" class="navigation-bar-container">
          <div id="navigation-bar-content" class="navigation-bar-content">
            <div id="show-archives-button" class="show-archives-button navigation-button" onclick="document.getElementById('flex-container').style.display = 'flex'; document.getElementById('concordance-table-container').style.display = 'none';">Aufbewahrungsorte</div>
            <div id="show-manuscript-concordance-button" class="show-manuscript-concordance-button navigation-button" onclick="document.getElementById('flex-container').style.display = 'none'; document.getElementById('concordance-table-container').style.display = 'block'; sortClickEventListener.setData(concordanceManuscriptTableData);">Handschriftenkonkordanz</div>
            <div id="show-print-concordance-button" class="show-print-concordance-button navigation-button" onclick="document.getElementById('flex-container').style.display = 'none'; document.getElementById('concordance-table-container').style.display = 'block'; sortClickEventListener.setData(concordancePrintTableData);">Konkordanz der Drucke</div>
          </div>
        </div>

        <script type="text/javascript">
          // remove test
          documentMetadata.metadata = documentMetadata.metadata.filter(function(metadata) {
            if(!(metadata.text === "test.xml")) {
              return true;
            }
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
                tableElementData.printResourceName = {"A8_IIIB18": "A8_IIIB18.all.html", "B9_IIIB20-2": "B9_IIIB20-2.all.html", "Ba9_A101286": "Ba9_A101286.all.html", "C(1)12_IIIB23-1": "C(1)12_IIIB23-1.all.html", "C(1)4_IIIB24": "C(1)4_IIIB24.html", "C(2a)4_IIIB28": "C(2a)4_IIIB28.html", "C(3)12_IIIB27": "C(3)12_IIIB27.all.html", "C(3)4_IIIB27_chartUngleich": "C(3)4_IIIB27_chartUngleich.html", "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I": "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I.all.html", "D(1)_IV3-1": "D(1)_IV3-1.all.html", "D(2)_IV3-6": "D(2)_IV3-6.all.html", "GSA_30-447-1_S_214-217": "GSA_30-447-1_S_214-217.html", "GSA_32_1420": "GSA_32_1420.html", "J_XIIA149-1808": "J_XIIA149-1808.html", "KuA_IIIE43-5-1": "KuA_IIIE43-5-1.html", "S(o)_IIIB11-2": "S(o)_IIIB11-2.all.html"}[textTranscriptName];
              }
              return tableElementData;
            };
          })());

          concordanceManuscriptTableData = concordanceTableData.filter(function(tableData) {return !tableData.isPrint;});
          concordancePrintTableData = concordanceTableData.filter(function(tableData) {return tableData.isPrint;});

          var concordanceTableContainer = document.getElementById("concordance-table-container");

          // create event listener to sort columns
          var sortClickEventListener = (function(tableData, concordanceColumns, parentElement) {
            var currentColumn;
            var currentSort = 0;
            var sortMethods = ["ascCiEnd", "descCiEnd"];

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
              tableDiv.firstElementChild.childNodes.item(currentColumn).className = "concordance-table-header-sorted-column";
              while(parentElement.firstChild) {
                parentElement.removeChild(parentElement.firstChild);
              }
              
              parentElement.appendChild(tableDiv);

              // set scrollTop to 0 so that the table begin is shown.
              parentElement.scrollTop = 0;

              // a fixed header can only be created if the underlaying table already exists.
              // otherwise the actual column widths is not available
              window.addEventListener("load", function(){
                createFixedHeader(tableDiv, parentElement);
              });
              window.addEventListener("resize", function(){
                createFixedHeader(tableDiv, parentElement);
              });

            }

            eventListener.setData = function(newTableData) {
              tableData = newTableData; 
              eventListener();
            };

            return eventListener;
          })(concordanceTableData, concordanceColumns, concordanceTableContainer); // initialize function

          // create function for table generation
          var createConcordanceTable = (function() {
            return function(concordanceColumns, concordanceData) {
              var i, j;
              
              var currentDocument;

              var concordanceTable = document.createElement("table");
              concordanceTable.id = "concordanceTable";
              concordanceTable.className = "concordance-table";

              var tableRow = document.createElement("tr");
              tableRow.className = "concordance-table-header";

              // create table header row
              for(i = 0; i < concordanceColumns.length; i++) {
                var tableData = document.createElement("th");
                tableData.addEventListener("click", sortClickEventListener);
                tableData.appendChild(document.createTextNode(concordanceColumns[i].column));
                tableRow.appendChild(tableData);
              }
              concordanceTable.appendChild(tableRow);

              // create rows for each column
              concordanceData.forEach(function(currentDocument, documentIndex) {
                tableRow = document.createElement("tr");
                if(currentDocument.isPrint) {
                  tableRow.addEventListener("click", function(){window.location = "print/" + currentDocument.printResourceName;});
                } else {
                  tableRow.addEventListener("click", function(){window.location = "documentViewer.php?faustUri=" + currentDocument.faustUri;});
                }

                concordanceColumns.forEach(function(currentColumn, columnIndex) {
                  tableData = document.createElement("td");
                  tableData.appendChild(document.createTextNode(concordanceData[documentIndex][columnIndex].text));
                  tableRow.appendChild(tableData);
                });
                concordanceTable.appendChild(tableRow);
              });

              return concordanceTable;
            };
          })();

          // function to create a fixed header
          var createFixedHeader = function(tableDiv, parentElement) {
            // remove fixed table header if exists
            var concordanceTableFixedHeader = document.getElementById("concordanceTableFixedHeader");
            if(concordanceTableFixedHeader !== null) {
              concordanceTableFixedHeader.parentElement.removeChild(concordanceTableFixedHeader);
            }

            // create copy of table header
            concordanceTableFixedHeader = tableDiv.cloneNode(true);
            concordanceTableFixedHeader.id = "concordanceTableFixedHeader";

            // firefox seems to have a bug and, if window is resized, misplaced the relative positioned element / header,
            // so that it can't be seen anymore, if scrollTop !== 0. to prevent this, scrolltop is set to 0 before creating
            // the header
            parentElement.scrollTop = 0;
            parentElement.insertBefore(concordanceTableFixedHeader, tableDiv);

            // get all children of cloned table and convert to array
            var concordanceTableRows = Array.prototype.slice.call(concordanceTableFixedHeader.childNodes);
            // remove table row from array
            concordanceTableRows.shift();
            // remove all table rows that are not a header row
            concordanceTableRows.forEach(function(childElement) { concordanceTableFixedHeader.removeChild(childElement); });

            concordanceTableFixedHeader.style.width = tableDiv.getBoundingClientRect().width + "px";
            concordanceTableFixedHeader.style.backgroundColor = "white";
            concordanceTableFixedHeader.style.position = "absolute";
            // adjust width of columns to match original table header widths. add white opaque background
            Array.prototype.slice.call(tableDiv.firstElementChild.childNodes).forEach(function(tableHeaderColumn, index) {
              var width = tableHeaderColumn.getBoundingClientRect().width;
              concordanceTableFixedHeader.firstElementChild.childNodes.item(index).style.width = width + "px";
            });
            Array.prototype.slice.call(concordanceTableFixedHeader.firstElementChild.childNodes).forEach(function(tableHeaderColumn, index) {
              tableHeaderColumn.addEventListener("click", sortClickEventListener);
            });
          };

          // create table
          sortClickEventListener.setData(concordanceManuscriptTableData);

        </script>







        <script type="text/javascript">
          var archiveArray;
          var repository;
          var i;

          // select only non-print witnesses from selected repository 
          var repositoryNonPrintEntries = documentMetadata.metadata.filter(function(metadata) {
            if( !(metadata.type === "print") ) {
              return metadata;
            }
          });

          // add count of witnesses and pages to each archive
          for(i = 0; i < repositoryNonPrintEntries.length; i++) {
            repository = repositoryNonPrintEntries[i].sigils.repository;
            if(archives[repository]) {
              if(!archives[repository].witnesses) {
                archives[repository].witnesses = 0;
                archives[repository].pages = 0;
              }
              archives[repository].witnesses++;
              archives[repository].pages = archives[repository].pages + repositoryNonPrintEntries[i].page.length;
            }
          }

          // convert archives to array and add array id to pushed object
          archiveArray = [];
          for(archiveId in archives) {
            archiveArray.push(archives[archiveId]);
            archiveArray[archiveArray.length - 1]["id"] = archiveId;
          }

          // sort archives asc
          var sortedArchives = Faust.sort(archiveArray, "asc", "name");

          // create output and append to page
          for(var i = 0; i < sortedArchives.length; i++) {
              var currentChild = sortedArchives[i];
              var archiveDiv = document.createElement("div");
              archiveDiv.className = "flex-child";

              var archiveDetailLink = document.createElement("a");
              archiveDetailLink.href = "archiveDetail.php?archiveId=" + currentChild["id"];
              archiveDiv.appendChild(archiveDetailLink);

              var archiveName = document.createElement("h3");
              archiveName.appendChild(document.createTextNode(currentChild.name));
              archiveDiv.appendChild(archiveName);
              
              if(currentChild.institution) {
                var institution = document.createTextNode(currentChild.institution);
                archiveDiv.appendChild(document.createElement("br"));
                archiveDiv.appendChild(institution);
              }

              if(currentChild.city || currentChild.country) {
                archiveDiv.appendChild(document.createElement("br"));
                var locationString;
                if(currentChild.city) {
                  locationString = currentChild.city;
                }
                if(currentChild.country) {
                  if(locationString) {
                    locationString = locationString + ", " + currentChild.country;
                  } else {
                    locationString = currentChild.country;
                  }
                }
                archiveDiv.appendChild(document.createTextNode(locationString));
              }

              archiveDiv.appendChild(document.createElement("br"));
              archiveDiv.appendChild(document.createTextNode("Zeugen: " + currentChild.witnesses + " | Seiten: " + currentChild.pages));
              document.getElementById("flex-container").appendChild(archiveDiv);
          } 
        </script>

      <?php include "includes/footer.php"; ?>
