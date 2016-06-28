<?php include "includes/header.php"; ?>
<section class="center pure-g-r">

  <article class="pure-u-1">

    <script>
      window.addEventListener("DOMContentLoaded", Faust.tooltip.addToTooltipElements);
    </script>

    <h3>Synopse der Zeugen</h3>

    <p><img alt="Beispiel eines Balkendiagramms" title="Beispiel eines Balkendiagramms" src="img/bar_graph.png"></p>

    <p>Das Balkendiagramm versammelt alle Zeugen zu einem ausgewählten Abschnitt des ‚Faust‘, z. B. einer Szene. Im Diagramm sind neben handschriftlichen und gedruckten Fassungen auch Paralipomena und Schemata berücksichtigt. Damit werden auch skizzenartige und stichworthafte Niederschriften ohne direkte Entsprechung im Werktext erfasst.</p>

    <p>Die Balken zeigen an, welchem Abschnitt des Werktextes ein Zeuge entspricht. Handschriftliche Fassungen sind blau, Drucke schwarz, Paralipomena grün und Schemata violett dargestellt. Lücken in einem Balken bedeuten, dass der Zeuge an dieser Stelle keine Entsprechung zum Werktext aufweist. Helle Farbabstufungen drücken bei den Paralipomena und Schemata Unsicherheit in der Zuordnung, bei den handschriftlichen Fassungen hohen Abweichungsgrad aus.</p>

    <p>Die Verszahlen des Werktextes sind von links nach rechts angetragen, die Siglen der Zeugen in chronologischer Folge von unten nach oben. Explizit macht das Diagramm nur Angaben zur chronologischen Ordnung von Fassungen, die gemeinsamen Text aufweisen.</p>

    <p><i>Beim Ansteuern eines Balkens werden das zugehörige Versintervall und die Überlieferungsform (Handschrift, Druck, Paralipomenon, Schema) angezeigt. Die Auswahl eines Balkens führt zur entsprechenden Stelle im Textzeugen.</i></p>
  
  </article>

</section>
<script type="text/javascript">
    document.getElementById('breadcrumbs').appendChild(Faust.createBreadcrumbs(
        [{caption: "Ausgabe", link: "intro"}, {caption: "Werkgenese retrospektiv"}]));
</script>
<?php include "includes/footer.php"; ?>
