<?php include "includes/header.php"; ?>

<section>

  <article>
      <div id="concordance-table-container"></div>
  </article>

</section>

<script type="text/javascript">
requirejs(['faust_common', 'jquery', 'faust_tables', 'jquery.table'],
        function(Faust, $, createConcordanceTable, $tables) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Handschriften"}]));
      createConcordanceTable(document.getElementById("concordance-table-container"));
      $("table[data-sortable]").fixedtableheader();
});
</script>

<?php include "includes/footer.php"; ?>
