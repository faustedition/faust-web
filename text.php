      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-center">
            <p>
             <a href="print/faust" class="pure-button pure-button-tile">Faust</a>
             <a href="paralipomena" class="pure-button pure-button-tile">Paralipomena</a>
            </p>
        
        </article>
        
        <div class="pure-u-1-5"></div>

      </section>
      <?php include "includes/footer.php"; ?>

      <script type="text/javascript">
      // set breadcrumbs
      requirejs(['faust_common'], function(Faust) {
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Text"}]));
      });
      </script>
