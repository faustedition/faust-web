      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-center">
            <p>
             <a href="archive_locations" class="pure-button pure-button-tile">Aufbewahrungs&shy;orte</a>
             <a href="archive_manuscripts" class="pure-button pure-button-tile">Hand&shy;schriften</a>
             <a href="archive_prints" class="pure-button pure-button-tile">Drucke</a>
             <a href="archive_testimonies" class="pure-button pure-button-tile">Entstehungs&shy;zeugnisse</a>
             <a href="archive_materials" class="pure-button pure-button-tile">Materialien</a>
            </p>
        
        </article>
        
        <div class="pure-u-1-5"></div>

      </section>
      <?php include "includes/footer.php"; ?>

      <script type="text/javascript">
        requirejs(['faust_common'], function(Faust) {
              document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv"}]));
        });
      </script>
