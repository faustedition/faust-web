<?php include "includes/header.php"; ?>

<section>

  <article>
      <table id="paralipomena" class="pure-table" data-sortable>
        <thead>
          <tr>
            <th data-sorted="true" data-sorted-direction="ascending" data-sortable-type="numericplus" class="pure-center" width="12">WA-Nummer</th>
            <th data-sorted="false" data-sortable-type="sigil">Zeuge</th>
            <th data-sorted="false" data-sortable-type="alpha">Incipit</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
  </article>

</section>

<?php include "includes/footer.php"; ?>

  <script type="text/javascript">
    // set breadcrumbs
    requirejs(['faust_common', 'data/paralipomena', 'sortable', 'jquery', 'jquery.table', 'scrollIntoView.min'],
        function(Faust, paralipomena, Sortable, $, $table, scrollIntoView) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Text", link: "text"}, {caption: "Paralipomena"}]));
        function createParalipomenaTable() {
            function getViewerURI(sigil) { 
                const sigil_t = sigil.replace('α', 'alpha').replace(/[^A-Za-z0-9.-]/, '_');
                return 'document?sigil=' + sigil_t;
            }
          function createSigilLink(sigil, uri) {
            return Faust.dom.createElement({name: "a", attributes: [["href", getViewerURI(sigil)]], children: [document.createTextNode(sigil)]});
          }
          function createParaLink(paralipomenon) {
            var href = getViewerURI(paralipomenon.sigil) + '&view=text';
            if (paralipomenon.page) { href = href + '&page=' + paralipomenon.page; }
            href = href + '#' + paralipomenon.id;
            return Faust.dom.createElement({name: "a", attributes: [["href", href]], children: [document.createTextNode(paralipomenon.n)]});
          }
          function createParaRow(paralipomenon) {
            var row  = Faust.dom.createElement({name: "tr", attributes: [["id", paralipomenon.id]]}),
                n    = Faust.dom.createElement({name: "td", parent: row, children: [createParaLink(paralipomenon)]}),
                sigil= Faust.dom.createElement({name: "td", parent: row,
                            children: [createSigilLink(paralipomenon.sigil, paralipomenon.uri)]}),
                text = Faust.dom.createElement({name: "td", parent: row,
                            children: [document.createTextNode(paralipomenon.text + " …")]});

            row.addEventListener("click", function(event) {
                if (event.target.nodeName.toLowerCase() === "a" && event.target.href)
                  window.location = event.target.href;
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
        Sortable.init();
        $("table[data-sortable]").fixedtableheader();

        if (window.location.hash) {
            const currentTarget = document.getElementById(window.location.hash.substring(1));
            if (currentTarget) {
                scrollIntoView(currentTarget);
                currentTarget.classList.add('target');
            }
        }
      });
  </script>
