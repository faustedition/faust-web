      <?php include "includes/header.php"; ?>
      <section>

        <article>
            <table id="prints" class="pure-table">
              <thead>
                <tr>
                  <th>Sigle</th>
                  <th>Kurzbeschreibung</th>
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
          document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Drucke"}]));
        </script>

        <script>
          // create table with prints. table data is fetched from the generated page inside the print folder
          var createPrintTable = function(container) {
            var table = document.getElementById(container);
            var tableBody = table.getElementsByTagName("tbody")[0];

            // fetch the generated html file containing the data for this table
            Faust.xhr.getResponseText("print/prints.html", function(printFile) {
              // create element to parse received html
              var printDom = document.createElement("div");
              printDom.innerHTML = printFile;

              // select only the information we need and sort the documents within
              var printDocuments = Array.prototype.slice.call(printDom.querySelectorAll("dt"));
              printDocuments = printDocuments.sort(function(doc1, doc2) {
                if(doc1.firstElementChild.firstChild.textContent === doc2.firstElementChild.firstChild.textContent) {
                  return 0;
                } else if(doc1.firstElementChild.firstChild.textContent < doc2.firstElementChild.firstChild.textContent) {
                  return -1;
                } else {
                  return 1;
                }
              });

              // generate a table row for each document that was found
              var num = 1;
              printDocuments.forEach(function(dt) {
                // create row
                var tableRow = Faust.dom.createElement({name: "tr", parent: tableBody});
                
                // add link / click event listener pointing to the document
                // tableRow.addEventListener("click", function(){window.location = "print" + dt.firstElementChild.href.substr(dt.firstElementChild.href.lastIndexOf("/"));});

                // add sigil
                var tableData = Faust.dom.createElement({name: "td", class: "pure-nowrap", parent: tableRow});
                var printLink = document.createElement("a");
                printLink.href = "print" + dt.firstElementChild.href.substr(dt.firstElementChild.href.lastIndexOf("/"));
                printLink.appendChild(document.createTextNode(dt.firstElementChild.firstChild.textContent));
                tableData.appendChild(printLink);

                // add document description
                tableData = Faust.dom.createElement({name: "td", parent: tableRow});
                tableData.appendChild(document.createTextNode(dt.nextElementSibling.textContent));
              });
            });
          };

          // directly append the table to its container
          createPrintTable("prints");
        </script>
