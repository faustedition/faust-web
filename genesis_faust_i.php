<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
  
  <article class="pure-u-1 pure-center">

      <?php include "img/chessboard_faust_i.svg";?>
  
  </article>

</section>

<script type="text/javascript">
    requirejs(['./js/faust_common'], function(Faust) {
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese", link: "genesis"}, {caption: "Faust I"}]));
    });
</script>
<?php include "includes/footer.php"; ?>
