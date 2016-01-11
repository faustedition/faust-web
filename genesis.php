      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <div class="pure-u-1-8"></div>
        
        <article class="pure-u-3-4 pure-center">

            <h2 class="pure-u-1-2">Faust I</h2>
            <h2 class="pure-u-1-2">Faust II</h2>
            <?php include "img/chessboard_overview.svg";?>
        
        </article>
        
        <div class="pure-u-1-8"></div>

      </section>
      <?php include "includes/footer.php"; ?>

      <script type="text/javascript">
        window.addEventListener("DOMContentLoaded", Faust.tooltip.addToTooltipElements);

        // set breadcrumbs
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese"}]));
      </script>
