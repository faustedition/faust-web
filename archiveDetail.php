      <?php include "includes/header.php"; ?>
        <style>
          .archives-content {
            width: 995px;
            margin: auto;
            overflow: auto;
          }

          .archive-details {
            padding: 2em 0em 2.5em 1.5em;
          }

          .archive-table {
            width: 75%;
            border-collapse: collapse;
          }

          .archive-table tr {
            border-bottom: 1px solid #ccc;
          }

          .archive-table > tr {
            cursor: pointer;
          }

          .archive-table-header > th {
            text-align: left;
            border: 0px none;
            padding: 0.5em;
            font-weight: bold;
          }

          .archive-table td {
            border: 0px none;
            padding: 0.5em;
          }

          .archives-content a {
            font-weight: bold;
            text-decoration: none;
          }
        </style>
        <div id="main-content" class="main-content">
          <div id="archives-content" class="archives-content">
            <div id="archive-details" class="archive-details">
              <h1 id="archiveName"></h1>
              <p id="institution"></p>
              <p id="location"></p>
              <a id="urlLink"><p id="url"></p></a>
            </div>
            <H2>Archivalien</H2>
            <table id="archive-table" class="archive-table">
              <tr id="archive-table-header" class="archive-table-header">
                <th>#</th>
                <th>Signatur</th>
                <th>WA-Sigle</th>
              <tr>
            </table>
          </div>
        </div>

        <script>
          var i;

          var repositoryName = "gsa";
          var repositorySigil;
          var idnoSigil;
          var waSigil;

          var displayData;



          // get actual parameters
          var parameters = Faust.url.getParameters();

          // if archiveId is set (should/must be), set repositoryName to that value
          if(parameters["archiveId"]) {
            repositoryName = parameters["archiveId"];
          }

          // set breadcrumbs
          document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv"}]));

          // select only non-print witnesses from selected repository and remove test
          var repositoryNonPrintEntries = documentMetadata.metadata.filter(function(metadata) {
            if( (metadata.sigils.repository === repositoryName) && !(metadata.type === "print") && !(metadata.text==="test.xml") ) {
              return true;
            }
          });

          // extract all information needed for displaying
          displayData = repositoryNonPrintEntries.map(function(entry) {

            // determine name of idno sigil to use 
            if(repositoryName === "gsa") {
              idnoSigil = "idno_gsa_2";
            } else {
              idnoSigil = "idno_" + repositoryName
            }

            // fill empty sigil data 
            if(entry.sigils[idnoSigil]) {
              repositorySigil = entry.sigils[idnoSigil];
            } else {
              repositorySigil = "";
            }

            // get wa_faust sigil
            if(entry.sigils["idno_wa_faust"]) {
              waSigil = entry.sigils["idno_wa_faust"];
            } else {
              waSigil = "-";
            }

            return {"repositorySigil": repositorySigil, "waSigil": waSigil, "documentUrl": "documentViewer.php?faustUri=faust://xml/document/" + entry.document};
          });

          // sort repository sigils
          displayData = displayData.sort(function(a, b) {
            if(a.repositorySigil > b.repositorySigil) {
              return 1;
            } else if(a.repositorySigil < b.repositorySigil) {
              return -1;
            } else {
              return 0;
            }
          });


          // write archive information

          // archive name
          document.getElementById("archiveName").appendChild(document.createTextNode(archives[repositoryName].name));

          // archive institution
          if(archives[repositoryName].institution) {
            document.getElementById("institution").appendChild(document.createTextNode(archives[repositoryName].institution));
          }

          // archive location
          if(archives[repositoryName].country || archives[repositoryName].city) {
            var locationString = "";
            if(archives[repositoryName].city) {
              locationString = archives[repositoryName].city;
            }
            if(archives[repositoryName].country) {
              if(locationString !== "") {
                locationString = locationString + ", ";
              }
              locationString = locationString + archives[repositoryName].country;
            }
            document.getElementById("location").appendChild(document.createTextNode(locationString));
          }

          // archive link
          if(archives[repositoryName].url) {
            document.getElementById("url").appendChild(document.createTextNode(archives[repositoryName].url));
            document.getElementById("urlLink").href = archives[repositoryName].url;
            document.getElementById("urlLink").title = archives[repositoryName].displayName;
          }



          // write sigil table
          var archiveTable = document.getElementById("archive-table");
          var tableRow;

          displayData.forEach(function(data, index){
            tableRow = document.createElement("tr");
            archiveTable.appendChild(tableRow);
            tableRow.addEventListener("click", function() { window.location = data.documentUrl; });

            var tableColumn1 = document.createElement("td");
            var tableColumn2 = document.createElement("td");
            var tableColumn3 = document.createElement("td");

            tableColumn1.appendChild(document.createTextNode(index + 1));
            tableColumn2.appendChild(document.createTextNode(data.repositorySigil));
            if(data.waSigil === "none" || data.waSigil === "-" || data.waSigil === "n.s.") {
              tableColumn3.appendChild(document.createTextNode(""));
            } else {
              tableColumn3.appendChild(document.createTextNode(data.waSigil));
            }

            tableRow.appendChild(tableColumn1);
            tableRow.appendChild(tableColumn2);
            tableRow.appendChild(tableColumn3);

          });

          document.getElementById("archives-content").appendChild(archiveTable);
        </script>
      <?php include "includes/footer.php"; ?>
