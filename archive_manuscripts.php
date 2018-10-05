<?php include "includes/header.php"; ?>

<section>

  <article>
      <div id="concordance-table-container"></div>

      <div id="loading-spinner" class="background-container">
          <div class="pure-center pure-fade-50">
              <i class="fa fa-spinner fa-pulse fa-5x"></i><br/>
              Ansicht wird geladen …
          </div>
      </div>

  </article>

</section>

<script type="text/javascript">
requirejs(['faust_common', 'jquery', 'faust_tables', 'jquery.table'],
        function(Faust, $, createConcordanceTable, $tables) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Handschriften"}]));
      createConcordanceTable(document.getElementById("concordance-table-container"));
      $("table[data-sortable]").fixedtableheader();
      Faust.finishedLoading();
});
</script>

<?php include "includes/footer.php"; ?>
