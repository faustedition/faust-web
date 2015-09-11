<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
    <article class="pure-u-1">
        <h1>Multispektrale Bildverarbeitung</h1>
        <p>In zahlreichen Handschriften werden Bleistiftspuren von späteren Niederschriften in Tinte
            überlagert. Die Bleistiftspuren sind hier wie auch generell oftmals stark verwischt. In
            Kooperation mit Jost Gippert und Manuel Raaf (Frankfurt am Main) wurde multispektrale
            Bildverarbeitung an Handschriften des Goethe- und Schiller-Archivs und des Freien
            Deutschen Hochstifts angewendet. Dies diente dem Ziel, die Bleistift- sowohl gegenüber
            der Tintenschicht als auch gegenüber dem Papieruntergrund deutlicher hervortreten zu
            lassen.</p>
        <p>Dabei kamen zwei Leuchten zum Einsatz, deren Strahlung in ihrer Zusammensetzung in etwa
            dem Tageslicht entspricht. Die Strahlungsleistung betrug je 850-Lumen und lag damit im
            Bereich zweier Glühlampen zwischen 60 und 75 Watt. Aus den vom Objekt reflektierten und
            in die Kamera einfallenden Strahlen wurden in Abständen über das gesamte Lichtspektrum
            verteilte Wellenlängenbereiche herausgefiltert. Anstelle der Leuchten wurde
            Infrarot-Strahlung eingesetzt, wenn der Farbunterschied zwischen den sich überlagernden
            Schreibmaterialien besonders gering war. Auf den Einsatz von Ultraviolettstrahlung wurde
            aus konservatorischen Gründen verzichtet.</p>
        <p>Am 21. Juni 2012 wurden am Freien Deutschen Hochstift Aufnahmen von Briefen Hugo von
            Hofmannsthals sowie von den zum ‚Faust‘ gehörigen Streifen angefertigt. Gute Ergebnisse
            wurden bei der Kontrastierung verschiedenfarbiger Schreibmaterialien erzielt, wie etwa
            einem Brief Hofmannsthals, bei dem schwarze mit dunkelblauer Tinte gezielt unlesbar
            gemacht worden war (Abb. 1). Die Separation war möglich, weil die dunkelblaue Tinte vom
            menschlichen Auge zwar schwer von der schwarzen zu unterscheiden ist, für einen Teil des
            Lichtspektrums (Wellenlänge um 440 nm) aber einen hohen Reflexionsgrad aufweist.</p>
        <p><img src="multispectral_imaging/media/image1.jpeg"/></p>
        <p>Abb. 1: FDH 30942,17 (Hugo von Hofmannsthal an Gerty von Hofmannsthal, 15. Oktober 1912).
            Wellenlänge: 440 nm. Text: „unserem unsagbar schönen Wiederzusammenkommen im März, da
            waren ja auch <em>andere</em> herzige Munderln ganz nahe davor, sogar ein bisserl
            verkatert davon warst du noch und doch – oder gerade darum? Wer kennt die Geheimnisse
            des Lebens! –“ Die Transkription wurde durch Nicoletta Giacon (Mailand) angefertigt.</p>
        <p>TODO Normallichtaufnahme („vorher“) zum Vergleich</p>
        <p>Die Aufnahme zeigt, dass die dunkelblaue Tinte einen bestimmten Teil des Lichtspektrums
            stark reflektiert, während die durch sie unlesbar gemachte schwarze Tinte auch diesen
            Teil des Lichtspektrums absorbiert und sich dadurch deutlich von der dunkelblauen
            abhebt. Ein ähnlicher Effekt zeigte sich bei den von vornherein nicht ganz schwarzen
            oder durch Korrosion braun gewordenen Eisengallustinten der im Goethe- und
            Schiller-Archiv befindlichen Handschriften zum ‚Faust‘ (die Aufnahmen wurden in
            Kooperation mit Manuel Raaf am 27. und 28. März 2013 angefertigt). Auch diese Tinten
            reflektieren einen Teil des Lichtspektrums stärker als andere und geben so den Blick auf
            die zugrundeliegende Bleistiftschicht frei (Abb. 2 und 3).</p>
        <p><img src="multispectral_imaging/media/image2.png"/></p>
        <p>Abb. 2: GSA 25/W 1638 (WA: 2 III H<sup>58</sup>), Vorderseite.</p>
        <p><img src="multispectral_imaging/media/image3.png"/></p>
        <p>Abb. 3: vgl. Abb. 2. Wellenlänge: 1000 nm.</p>
        <p>Durch geeignete Kombination der Bilder aus verschiedenen Spektralbereichen konnten die
            Tintenschichten vollständig unsichtbar gemacht werden. Dabei wurde sowohl ein manuelles
            wie auch ein automatisches Verfahren zur Kombination der Spektralaufnahmen getestet.
            Beim manuellen Verfahren wurden zwei Spektralaufnahmen ausgewählt und mit einer
            Bildverarbeitungssoftware subtrahierend übereinandergelegt. Beim automatischen Verfahren
            wurde zu jedem Bildpunkt eine Regressionsanalyse durchgeführt, wobei der Vektor der
            Helligkeitswerte aller Spektralaufnahmen die abhängige und der Helligkeitswert der
            Bleistiftspur die Zielvariable darstellte. Beide Verfahren lieferten vergleichbare
            Ergebnisse.</p>
        <p><img src="hyperspectral_imaging/media/image4.png"/></p>
        <p>Abb. 4: Vgl. Abbildung 2. Manuelles Verfahren.</p>
        <p><img src="hyperspectral_imaging/media/image5.png"/></p>
        <p>Abb. 5: vgl. Abbildung 2. Automatisches Verfahren.</p>
        <p>Es gelang jedoch nicht, den Kontrast zwischen stark verwischten Bleistiftspuren und dem
            Papieruntergrund so zu verstärken, dass zuvor unlesbare Bleistiftspuren lesbar gemacht
            worden wären. Gegenüber der digitalen Manipulation vorhandener Abbildungen konnten hier
            keine Fortschritte in Form von möglichen Lesungen erzielt werden.</p>


    </article>
</section>
<?php include "includes/footer.php"; ?>
