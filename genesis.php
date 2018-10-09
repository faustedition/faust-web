<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
  
  <article class="pure-u-1 pure-center">
      <?php include "img/genesis_entry.svg";?>
  
  </article>

</section>

<script type="text/javascript">
    requirejs(['faust_common','json!data/testimony-stats', 'domReady'], function(Faust, testimony, domReady) {
        // set breadcrumbs
      domReady(function() {
        Faust.context.setContextSimple("Genese", []);
        Object.keys(testimony.counts).forEach(function (year) {
          var el = document.getElementById('tes_' + year);
          if (el) {
            var height = testimony.counts[year] / testimony.max;
            el.setAttribute('height', height)
            el.setAttribute('title', year + ': ' + testimony.counts[year] + ' Entstehungszeugnisse');
          }
        });
        Faust.tooltip.addToTooltipElements();
      });
    });
</script>

<?php include "includes/footer.php"; ?>
