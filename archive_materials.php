      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r" data-breadcrumbs="Archiv@archive" data-title="Materialien">
        
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-center">
            <p>
             <a href="archive_schillemeit" class="pure-button pure-button-tile">Schillemeit, Faust-Aufzeichnungen</a>
             <a href="archive_x-ray_spectrometry" class="pure-button pure-button-tile">Ergebnisse der Röntgenfluoreszenzanalyse</a>
             <a href="archive_watermarks" class="pure-button pure-button-tile">Wasserzeichenaufnahmen</a>
             <a href="archive_multispectral_imaging" class="pure-button pure-button-tile">Multispektralaufnahmen</a>
            </p>
        
        </article>
        
        <div class="pure-u-1-5"></div>

      </section>
      <?php include "includes/footer.php"; ?>

      <script type="text/javascript">
        requirejs(['faust_common'], function(Faust) {
              document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Materialien"}]));
        });
      </script>
