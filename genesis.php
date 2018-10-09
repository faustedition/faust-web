<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
  
  <article class="pure-u-1 pure-center">
      <?php include "img/genesis_entry.svg";?>
  
  </article>

</section>

<script type="text/javascript">
    requirejs(['faust_common','json!data/testimony-stats', 'json!data/witness-stats', 'domReady'],
      function(Faust, testimony, witnesses, domReady) {
        // set breadcrumbs
      domReady(function() {
        Faust.context.setContextSimple("Genese", []);

        var updateGraph = function(data, idPrefix, labelSuffix) {
          try {
            Object.keys(data.counts).forEach(function (year) {
              var el = document.getElementById(idPrefix + year);
              if (el) {
                var height = data.counts[year] / data.max;
                el.setAttribute('height', height)
                if (labelSuffix)
                  el.setAttribute('title', year + ': ' + data.counts[year] + labelSuffix);
              }
            });
          } catch (e) {
            console.error(e, 'while updating graph', idPrefix)
          }
        };

        updateGraph(testimony, 'tes_', ' Entstehungszeugnisse');
        updateGraph(witnesses, 'wit_');

        Faust.tooltip.addToTooltipElements();
      });
    });
</script>

<?php include "includes/footer.php"; ?>
