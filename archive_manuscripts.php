<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section>

  <article>
      <div id="concordance-table-container"></div>
  </article>

</section>

<script type="text/javascript">
  requirejs(['./js/faust_common'], function(Faust) {
    requirejs(['faust_tables'], function(createConcordanceTable) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Handschriften"}]));
      createConcordanceTable(document.getElementById("concordance-table-container"));
    });
  });
</script>

<?php include "includes/footer.php"; ?>
