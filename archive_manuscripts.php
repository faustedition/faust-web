<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section>

  <article>
      <div id="concordance-table-container"></div>
  </article>

</section>

<script type="text/javascript">
  requirejs(['./js/faust_common'], function(Faust) {
    requirejs(['jquery', 'faust_tables', 'jquery.table'],
        function($, createConcordanceTable, $tables) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Handschriften"}]));
      createConcordanceTable(document.getElementById("concordance-table-container"));
      $("table[data-sortable]").fixedtableheader();
      window.addEventListener("DOMContentLoaded", Faust.tooltip.addToTooltipElements);
    });
  });
</script>

<?php include "includes/footer.php"; ?>
