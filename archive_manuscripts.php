<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section>

  <article>
      <div id="concordance-table-container"></div>
  </article>

</section>

<script type="text/javascript" src="data/archives.js"></script>

<script type="text/javascript" src="js/faust_tables.js"></script>
<script type="text/javascript">
  // set breadcrumbs
  document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Handschriften"}]));
  createConcordanceTable(document.getElementById("concordance-table-container"));
</script>

<?php include "includes/footer.php"; ?>
