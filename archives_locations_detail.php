      <?php include "includes/header.php"; ?>
      <section class="center">

        <article class="pure-center">
            <h1 id="archiveName"></h1>
            <p>
              <span id="institution"></span><br>
              <span id="location"></span><br>
              <a id="urlLink"><span id="url"></span></a>
            </p>

            <h2>Archivalien</h2>
            <table id="archive-table" class="pure-table">
              <thead>
              <tr>
                <th width="10" class="pure-center">#</th>
                <th class="pure-left">Signatur</th>
                <th class="pure-left">WA-Sigle</th>
              <tr>
              </thead>
              <tbody>
              </tbody>
            </table>
        </article>

      </section>
      <?php $showFooter = false; ?>
      <?php include "includes/footer.php"; ?>

        <script>
          var i;

          var repositoryName = "gsa";
          var repositorySigil;
          var idnoSigil;
          var waSigil;

          var displayData;



          // get actual parameters
          var parameters = Faust.url.getParameters();

          // if 'id' is set (mandatory), set repositoryName to that value
          if(parameters["id"]) {
            repositoryName = parameters["id"];
          }

          // set breadcrumbs
           document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archives.php"}, {caption: "Aufbewahrungsorte", link: "archives_locations.php"}, {caption: archives[repositoryName].name}]));

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
            var link = document.createElement("a"); // need object to return hostname
            link.href = archives[repositoryName].url;
            document.getElementById("url").appendChild(document.createTextNode(link.hostname));
            document.getElementById("urlLink").href = archives[repositoryName].url;
            document.getElementById("urlLink").title = archives[repositoryName].displayName;
          }



          // write sigil table
          var archiveTable = document.getElementById("archive-table").getElementsByTagName("tbody")[0];
          var tableRow;

          displayData.forEach(function(data, index){
            tableRow = document.createElement("tr");
            archiveTable.appendChild(tableRow);
            tableRow.addEventListener("click", function() { window.location = data.documentUrl; });

            var tableColumn1 = document.createElement("td");
            var tableColumn2 = document.createElement("td");
            tableColumn2.className = "pure-nowrap pure-left";
            var tableColumn3 = document.createElement("td");
            tableColumn3.className = "pure-nowrap pure-left";

            tableColumn1.appendChild(document.createTextNode(index + 1));

            var repositorySigilLink = document.createElement("a");
            repositorySigilLink.href = "javascript:void();";
            repositorySigilLink.appendChild(document.createTextNode(data.repositorySigil))
            tableColumn2.appendChild(repositorySigilLink);

            var waSigilLink = document.createElement("a");
            waSigilLink.href = "javascript:void();";
            if(data.waSigil === "none" || data.waSigil === "-" || data.waSigil === "n.s.") {
              waSigilLink.appendChild(document.createTextNode(""));
            } else {
              waSigilLink.appendChild(document.createTextNode(data.waSigil));
            }
            tableColumn3.appendChild(waSigilLink);

            tableRow.appendChild(tableColumn1);
            tableRow.appendChild(tableColumn2);
            tableRow.appendChild(tableColumn3);

          });

          document.getElementById("archives-content").appendChild(archiveTable);
        </script>
      </div>
      <?php include "includes/footer.php"; ?>
