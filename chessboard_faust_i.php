      <?php include "includes/header.php"; ?>
      <div class="main-content-container">
        <script>
          window.addEventListener("DOMContentLoaded", Faust.tooltip.addToTooltipElements);
          document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese", link: "chessboard.php"}, {caption: "Faust I"}]));
        </script>
        <div id="main-content" class="main-content">
          <div style="float: left;">
            <?php include "img/chessboard_faust_i.svg";?>
          </div>

          <div align="center" style="padding: 2em 0em">
            <strong>
              Werkgenese retrospektiv<br>
              Faust. Der Tragödie Erster Teil<br>
            </strong>
          </div>
          <p style="padding-top: 30x;">Die Grafik stellt die Entstehung des ersten Teils von Goethes ‚Faust‘ vom abgeschlossenen Werk ausgehend dar.</p>

          <p>Die einleitenden Abschnitte ‚Zueignung‘, ‚Vorspiel‘ und ‚Prolog‘ bleiben unbeziffert, die Szenen werden durchgezählt. Beim Ansteuern einer Spalte erscheint der Szenentitel.</p>

          <p>Die angetragenen Jahreszahlen entsprechen entstehungsgeschichtlich relevanten, an Arbeitsphasen orientierten Daten.</p>

          <p>Die verschiedenen Einfärbungen der Felder zeigen den Ausarbeitungsgrad an. Weiß bedeutet, dass der betroffene Textabschnitt zu dieser Zeit nicht vorliegt. Grau indiziert Unabgeschlossenheit, Schwarz Fertigstellung.</p>

          <p><i>Die Auswahl einer Spalte führt zu einem <a href="geneticBarGraphInfo.php"><u>Balkendiagramm</u></a>, in dem alle relevanten Handschriften und Drucke angezeigt werden.</i></p>
        </div>
      </div>
      <?php include "includes/footer.php"; ?>
