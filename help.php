<?php


$target = '';

function inreferer($substring) { 
  $referrer = $_SERVER['HTTP_REFERER'];
  return strpos($referrer, $substring) !== false; 
}


    if (inreferer('archive_prints')) 	$target = 'intro#drucke';
elseif (inreferer('/print/faust'))  	$target = 'intro#text';
elseif (inreferer('/print/text')) 		$target = 'intro#text';
elseif (inreferer('/print/')) 		$target = 'intro#drucke';
elseif (inreferer('/meta/')) 		$target = 'metadata';
elseif (inreferer('view=structure')) 	$target = 'metadata';
elseif (inreferer('genesis_faust')) 	$target = 'intro#genesis_part';
elseif (inreferer('genesis_bargraph')) 	$target = 'intro#genesis_bargraph';
elseif (inreferer('genesis')) 		$target = 'intro#genesis';
elseif (inreferer('search')) 		$target = 'intro#volltextsuche';
elseif (inreferer('testimon')) 		$target = 'intro#testimony';
elseif (inreferer('macrogenesis')) 		$target = '/macrogenesis/help';
elseif (inreferer('view=document_text')) 	$target = 'transcription_guidelines#txt_Transkr_Hss';
elseif (inreferer('view=text')) 		$target = 'transcription_guidelines#txt_Transkr_Hss';
elseif (inreferer('view=print')) 		$target = 'transcription_guidelines#txt_Transkr_Hss';
elseif (inreferer('view=document')) 	$target = 'transcription_guidelines#dok_Transkr_Hss';
elseif (inreferer('view=facsimile_document')) 	$target = 'transcription_guidelines#dok_Transkr_Hss';


if ($target) {
  header('Location: ' . $target);
  exit();
}

?>


<?php include "includes/header.php"; ?>
<section class="center pure-g-r wip">

  <div class="pure-u-1-5"></div>

  <article class="pure-u-3-5">
    <h3>folgt demnächst</h3>

    <p>Die Hilfefunktion ist noch in Arbeit und wird in einer der nächsten Versionen ergänzt.</p>

    <p>Einige Benutzungshinweise finden Sie <a href="intro">in der Einführung in die Ausgabe</a>.</p>




  </article>

  <div class="pure-u-1-5">
  </div>

</section>

<script type="text/javascript">
    requirejs(['faust_common'], function(Faust) {
      // set breadcrumbs
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Hilfe"}]));
    });
</script>
<?php include "includes/footer.php"; ?>
