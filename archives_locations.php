      <?php include "includes/header.php"; ?>
      <section>

        <article>
            <h1 class="pure-center">Aufbewahrungsorte</h1>

            <table id="locations" class="pure-table">
              <thead>
                <tr>
                  <th class="pure-center" width="10">#</th>
                  <th>Archiv</th>
                  <th>Ort</th>
                  <th class="pure-center">Zeugen</th>
                  <th class="pure-center">Seiten</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
        </article>

      </section>
      <?php $showFooter = false; ?>
      <?php include "includes/footer.php"; ?>




        <script type="text/javascript">
          // set breadcrumbs
          document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archives.php"}, {caption: "Aufbewahrungsorte"}]));
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
              var archiveTr = document.createElement("tr");

              var archiveNumCell = document.createElement("td");
              archiveNumCell.className = "pure-center";
              archiveNumCell.appendChild(document.createTextNode(i + 1));
              archiveTr.appendChild(archiveNumCell);

              var archiveDetailLink = document.createElement("a");
              archiveDetailLink.href = "archives_locations_detail.php?id=" + currentChild["id"];

              var archiveNameCell = document.createElement("td");
              var archiveName = document.createElement("strong");
              archiveName.appendChild(document.createTextNode(currentChild.name));
              archiveDetailLink.appendChild(archiveName);
              archiveNameCell.appendChild(archiveDetailLink);
              
              if(currentChild.institution) {
                var institution = document.createTextNode(currentChild.institution);
                archiveNameCell.appendChild(document.createElement("br"));
                archiveNameCell.appendChild(institution);
              }
              archiveTr.appendChild(archiveNameCell);

              var archiveLocationCell = document.createElement("td");
              if(currentChild.city || currentChild.country) {
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
                archiveLocationCell.appendChild(document.createTextNode(locationString));
              }
              archiveTr.appendChild(archiveLocationCell);

              var archiveWitnessCell = document.createElement("td");
              archiveWitnessCell.className = "pure-center";
              archiveWitnessCell.appendChild(document.createTextNode(currentChild.witnesses));
              archiveTr.appendChild(archiveWitnessCell);

              var archivePagesCell = document.createElement("td");
              archivePagesCell.className = "pure-center";
              archivePagesCell.appendChild(document.createTextNode(currentChild.pages));
              archiveTr.appendChild(archivePagesCell);

              var table = document.getElementById("locations");
              table.getElementsByTagName("tbody")[0].appendChild(archiveTr);
          } 
        </script>