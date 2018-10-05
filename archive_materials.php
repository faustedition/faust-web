      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-center">
            <p>
             <a href="archive_schillemeit" class="pure-button pure-button-tile">Vorarbeiten zu einer Geschichte des ‚Faust‘ von Jost Schillemeit</a>
             <a href="watermarks" class="pure-button pure-button-tile">Wasserzeichen</a>
             <a href="multispectral_imaging" class="pure-button pure-button-tile">Multispektrale Bildverarbeitung</a>
             <a href="x-ray_spectrometry" class="pure-button pure-button-tile">Röntgenfluoreszenzanalyse</a>
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
