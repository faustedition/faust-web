<?php include "includes/header.php"; ?>
<section>

  <article>
      <table id="paralipomena" class="pure-table">
        <thead>
          <tr>
            <th class="pure-center" width="10">Paralipomenon</th>
            <th>Zeuge</th>
            <th>Incipit</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
  </article>

</section>
<?php $showFooter = false; ?>
<?php include "includes/footer.php"; ?>

  <script src="data/paralipomena.js"></script>

  <script type="text/javascript">
    // set breadcrumbs
    document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Paralipomena"}]));
  </script>

  <script type="text/javascript">
    function createParalipomenaTable() {
      function getViewerURI(faustURI) { return 'documentViewer?faustUri=' + faustURI }
      function createSigilLink(sigil, uri) {
        return Faust.dom.createElement({name: "a", attributes: [["href", getViewerURI(uri)]], children: [document.createTextNode(sigil)]});
      }
      function createParaRow(paralipomenon) {
        var row  = Faust.dom.createElement({name: "tr"}),
            n    = Faust.dom.createElement({name: "td", parent: row, children: [document.createTextNode(paralipomenon.n)]}),
            sigil= Faust.dom.createElement({name: "td", parent: row, 
                        children: [createSigilLink(paralipomenon.sigil, paralipomenon.uri)]}),
            text = Faust.dom.createElement({name: "td", parent: row, 
                        children: [document.createTextNode(paralipomenon.text)]});

        row.addEventListener("click", function(event) {
            if (event.target.nodeName.toLowerCase() === "a" && event.target.href)
              wndow.location = event.target.href;
            else
              window.location = getViewerURI(paralipomen.uri);
        });
        return row;
      }

      var table = document.getElementById("paralipomena"),
          tbody = table.getElementsByTagName("tbody")[0]
      for (var i = 0; i < paralipomena.length; i++) {
          tbody.appendChild(createParaRow(paralipomena[i]));
      }
    };
    createParalipomenaTable();
  </script>
