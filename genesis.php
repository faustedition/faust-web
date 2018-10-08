<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
  
  <article class="pure-u-1 pure-center">
      <?php include "img/genesis_entry.svg";?>
  
  </article>

</section>

<script type="text/javascript">
    requirejs(['faust_common'], function(Faust) {
        // set breadcrumbs
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese"}]));
    });
</script>

<?php include "includes/footer.php"; ?>
