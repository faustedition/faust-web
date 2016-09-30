<?php include "includes/header.php"; ?>
<section class="center pure-g-r">
    <article class="pure-u-1">
        <p>Die zurzeit sichtbare Version der Ausgabe ist noch nicht endgültig, sondern
            eine Beta-Version. Mit den drei Säulen „Archiv“, „Genese“ und „Text“ sind hier jedoch 
            bereits alle grundlegenden Funktionalitäten realisiert.</p>
        <p>Die Erscheinung der Version 1.0 ist für das Frühjahr 2017 vorgesehen. Sie soll einige
            Leistungen und Bestandteile enthalten, die in der Beta-Version noch fehlen:</p>
        <p>Die Ausgabe stellt bereits in der Beta-Version das komplette <strong>Archiv</strong> der Faust-Handschriften und der
            Drucke zu Lebzeiten als Faksimile und in dokumentarischer wie textueller Umschrift samt
            Metadaten zur Verfügung. Die Abbildungen der Drucke sind jedoch noch nicht verfügbar, ebenso
            fehlen noch Mehrfachabbildungen von Handschriftenseiten bei Aufklebungen und ähnlichen
            Fällen. Die dokumentarische Transkription weist an einigen Stellen noch unerwünschte
            Abstände und weitere ästhetische Mängel auf, die mit der Version 1.0 behoben werden
            sollen. Die Texte und Angaben in den Handschriftenbeschreibungen (Metadaten) 
            werden noch überarbeitet. In der
            Version 1.0 sollen ergänzend Angaben über Datierungen und die relative
            Chronologie aufgenommen werden, zudem werden die Transkriptionen mit Persistent 
            Identifiern versehen. Die Darstellung der textuellen Transkriptionen 
            ist automatisch generiert und wird zurzeit noch überprüft. Etwaige Fehler können per E-Mail an Gerrit Brüning (<a
                href="mailto:bruening@faustedition.de">bruening@faustedition.de</a>) gemeldet
            werden.</p>
        <p>Im Bereich <strong>Genese</strong> liefert die Beta-Version grafische
            Übersichtsdarstellungen und Detailansichten. Das Balkendiagramm, das die
            Gesamtüberlieferung visualisiert, ist zurzeit, wie die Übersichtstabellen der
            handschriftlichen und gedruckten Überlieferung, nach Siglen sortiert. In der Version 1.0
            soll eine chronologische Sortierung angeboten werden.</p>
        <p>Als <strong>Lesetext</strong> wird in der Beta-Version  eine getreue, unemendierte Wiedergabe des ‚Faust&nbsp;I‘ nach dem Druck 
        im achten Band der ersten Cotta’schen Gesamtausgabe (A) sowie des ‚Faust&nbsp;II‘ nach der großen Reinschrift (H) angeboten. 
        Ein konstituierter Lesetext soll in der Version 1.0 folgen. In den Lesetext ist eine zeilensynoptische
            Darstellung der übrigen Fassungen und der Zugang zu den betreffenden Zeugen integriert. Die Beta-Version
            beschränkt sich hier auf die Darstellung der jeweiligen Endstufen der entsprechenden
            Handschriften. Die Integration der Binnenvarianz, wie sie bislang schon in den
            Einzelansichten zu jeder Handschrift dargestellt wird, soll hier noch erfolgen. Außerdem
            sollen die Fassungen in der zeilensynoptischen Darstellung künftig chronologisch
            sortiert werden.</p>
        <p>Die Funktionalität der Ausgabe soll in der Version 1.0 durch eine spezielle
            <strong>Hilfe</strong>-Funktion noch intuitiver erschlossen werden.</p>
        <p>Die <strong>Suche</strong> soll ebenfalls noch verbessert werden.</p>
        <p>Beginnend mit einer der nächsten Beta-Versionen werden die Transkriptionen 
         in Form der 
            zugrundeliegenden TEI-XML-Codierung sowie nach und nach auch alle weiteren Inhalte der Edition zum Download bereitgestellt werden.</p>
        <p>Der <strong>Code</strong> der gesamten Applikation wird auf <a href="https://github.com/faustedition"
            >GitHub</a> verwaltet. Eventuelle Fehler oder Mängel der Web-Funktionalität können
            <a href="https://github.com/faustedition/faust-web/issues">hier</a> gemeldet
            werden.</p>
        <p>Wenn Sie über <strong>neue Versionen</strong> der Ausgabe informiert werden wollen, können Sie sich <a href="http://www.listserv.dfn.de/cgi-bin/wa?SUBED1=faustedition-news&amp;X=&amp;Y=">hier in eine Ankündigungsliste</a> eintragen.</p>
        <p>Rosemarie Schillemeit gewährte umfassenden Einblick in die Materialien zur Faust-Genese im Nachlass
            <strong>Jost Schillemeits</strong> und stellte ihre Transkription dieser
            Aufzeichnungen bereitwillig zur Verfügung. In der Version 1.0 sollen diese Aufzeichnungen in einem
            besonderen Teil der digitalen Ausgabe verfügbar gemacht werden.</p>
        <h2>Release am ###. Oktober 2016 (Beta-Version 2)</h2>
        <p>Die Beta-Version 2 bringt zahlreiche Änderungen der Benutzeroberfläche mit sich, von denen hier nur die wichtigsten genannt werden können:</p>
        <h3>Archiv</h3>
        <ul>
            <li>Alle Tabellen sind nun nach allen Spalten sortierbar.</li>
            <li>Die <a ref="archive_prints">Liste der Drucke</a> ist chronologisch sortiert.</li>
            <li>Unter „Archiv“ ist eine Liste der <a ref="archive_testimonies">Dokumente zur Entstehungsgeschichte</a> abrufbar, an der zurzeit noch gearbeitet wird.</li>
            <li>Beim Blättern in der Handschriftenansicht werden leere Seiten übersprungen.</li>
            <li>Die angezeigte Information über die Wasserzeichen ist vereinheitlicht worden. Dies geschah unter nochmaliger Rücksprache mit <a ref="credits_coop">Andrea Lothe</a>.</li>
            <li>Die Navigation innerhalb der textuellen Transkription wurde verbessert (Aufteilung umfangreicher Texte, Inhaltsverzeichnis, Seitenzahlen).</li>
            <li>Das Design der Ansicht der letzten abhebbaren Stufe entspricht dem neu gestalteten Design des Lesetextes (s.u. zu „Text“).</li>
        </ul>
        <h3>Genese</h3>
        <ul>
            <li>Das Farbschema der grafischen Übersichten zu einzelnen Szenen (Balkendiagramm) ist auf das grundlegende Design der Ausgabe abgestimmt.</li>
            <li>Tooltips liefern Detailinformationen zu den einzelnen Balkenabschnitten.</li>
            <li>Die von dort aus auf die einzelnen Druck verweisenden Links führen zum betreffenden Textabschnitt.</li>
            <!--li>Durch Anpassen der Zahlen im letzten Teils der URL (z.B. <code>rangeStart=1&amp;rangeEnd=32</code>) kann das Balkendiagramm auf ein beliebiges Intervall von Versen 
            ausgedehnt oder eingeschränkt werden. Benutzerfreundliche Eingabefelder dazu folgen in der nächsten Version.</li-->
        </ul>
        <h3>Text</h3>
        <ul>
            <li>Im Bereich „Text“ ist eine Liste der sogenannten <a ref="paralipomena">Paralipomena</a> nach der Zählung in der Weimarer Ausgabe 
            (<a ref="bibliography#wa_I_14">WA I 14</a> und <a ref="bibliography#wa_I_15_2">WA I 15.2</a>) abrufbar. In den textuellen Transkriptionen 
            sind die Paralipomena am Rand markiert.</li>
            <li>Das Design und die Benutzbarkeit des Lesetextes und der zeilensynoptischen Darstellung wurden grundlegend verbessert (farbliche und 
            typographische Gestaltung). Pop-ups (Tooltips) über den Zeilen machen auf die Anzahl der vorkommenden Fassungen und Varianten einer Passage 
            aufmerksam. Bewegt man den Zeiger über eine der Siglen in der Zeilensynopse, erscheint eine Kurzbeschreibung.</li>
            <li>In Lesetext und Zeilensynopse werden nun auch Stellen mit abweichender Verseinteilung in verschiedenen Fassungen korrekt dargestellt 
            (z.B. <a ref="http://dev.faustedition.net/print/faust1.17#l3356%203357">Faust I, Vers 3356f.</a>).</li>
            <li>In den Varianten zur Szene ‚<a ref="###">Trüber Tag. Feld</a>‘ erscheint nun auch der ‚Urfaust‘ 
            (<a ref="documentViewer?faustUri=faust://xml/document/faust/0/gsa_390028.xml&page=85&view=facsimile_document">1 H.5</a>).</li>
        </ul>
        <h3>Suche</h3>
        <ul>
            <li>Die Suche wurde neuimplementiert, so dass größere Ergebnismengen nun schneller ausgeliefert werden. Zur Erhöhung der Übersichtlichkeit geschieht dies nun auf einer Seite.</li>
            <li>Die Ergebnisse können nach den Kriterien Relevanz, Sigle und Textstelle sortiert werden.</li>
            <li>Auch nach Zeugensiglen und Archivsignaturen kann nun gesucht werden, siehe <a ref="intro#volltextsuche">Volltextsuche</a>.</li>
        </ul>
        <h3>Sonstiges</h3>
        <p>Über die genannten hinaus wurden u.a. folgende Verbesserungen vorgenommen:</p>
        <ul>
            <li>korrekte Sortierung der <a ref="bibliography">Bibliographie</a></li>
            <li>Kennzeichnung externer Links</li>
            <li>Vereinheitlichung der Seitentitel (‚Breadcrumbs‘).</li>
            <li>diverse Detailverbesserungen und Bugfixes</li>
        </ul>
        <h2>Frühere Versionen</h2>
        <p>Informationen über die Release der Beta-Version 1 <a href="beta-release1">hier</a>.</p>
    </article>
</section>

<script type="text/javascript">
    document.getElementById('breadcrumbs').appendChild(Faust.createBreadcrumbs(
        [{caption: "Ausgabe", link: "intro"}, {caption: "Beta-Version"}]));
</script>

<?php include "includes/footer.php"; ?>
