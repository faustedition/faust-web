<?php include "includes/header.php"; ?>

<section class="center pure-g-r">
  
  <article class="pure-u-1 pure-center">

      <?php include "img/chessboard_faust_ii.svg";?>
  
  </article>

</section>

<script type="text/javascript">
    requirejs(['faust_common'], function(Faust) {
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese", link: "genesis"}, {caption: "Faust II"}]));
    });
</script>

<?php include "includes/footer.php"; ?>
