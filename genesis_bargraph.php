<?php include "includes/header.php"; ?>

<section>

  <article>

      <div id="genetic-bar-diagram-container"></div>

  </article>

</section>

<div id="navigation-bar-container" class="navigation-bar-container">
  <div id="navigation-bar-content" class="navigation-bar-content">
    <div id="facsimile-settings" class="facsimile"></div>
    <div id="page-navigation" class="page">
      <div id="first-page-button" class="pure-button" title="Erste Seite"><i class="fa fa-angle-double-left"></i></div>
      <div id="previous-page-button" class="pure-button" title="Vorherige Seite"><i class="fa fa-angle-left"></i></div>
      <div id="pageCount" class="pure-form">
        <input id="start-range-input" type="text" pattern="\d+" input-type="numeric" size="1" class="pure-center" value="">
        bis
        <input id="end-range-input" type="text" pattern="\d+" input-type="numeric" size="1" class="pure-center" value="">
      </div>
      <div id="next-page-button" class="pure-button" title="Nächste Seite"><i class="fa fa-angle-right"></i></div>
      <div id="last-page-button" class="pure-button" title="Letzte Seite"><i class="fa fa-angle-double-right"></i></div>
    </div>
    <div id="view-select" class="view"></div>
  </div>
</div>

<script>
  require(['faust_bargraph']);
</script>

<?php include "includes/footer.php"; ?>
