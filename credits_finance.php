<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
    <article class="pure-u-1">
        <p>Das Projekt wurde von 2009 bis 2014 von der Deutschen Forschungsgemeinschaft finanziell
            getragen.</p>
        <p>Die Richard und Effi Biedrzynski-Stiftung stellte eine namhafte Summe zur Förderung des Projekts zur
            Verfügung.</p>
    </article>
</section>

<script type="text/javascript">
    requirejs(['faust_common'], function(Faust) {
        document.getElementById('breadcrumbs').appendChild(Faust.createBreadcrumbs(
            [{caption: "Projekt", link: "project"}, {caption: "Danksagung", link: "credits"}, {caption: "Finanzielle Förderung"}]));
    });
</script>

<?php include "includes/footer.php"; ?>
