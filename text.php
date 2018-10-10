      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-center">
            <h1 class="centered">Faust</h1>
            <h2 class="centered">Eine Tragödie</h2>
            <p>
             <a href="print/faust" class="pure-button pure-button-tile">Konstituierter Text</a>
             <a href="print/app" class="pure-button pure-button-tile">Apparat</a>
             <a href="intro_text" class="pure-button pure-button-tile">Editorischer Bericht</a>
                <br/>
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
