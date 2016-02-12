<?php


$target = '';

function inurl($substring) { 
  $referrer = $_SERVER['HTTP_REFERER'];
  return strpos($referrer, $substring) !== false; 
}


    if (inurl('archive_prints')) 	$target = 'intro#drucke';
elseif (inurl('/print/faust'))  	$target = 'intro#lesetext';
elseif (inurl('/print/text')) 		$target = 'intro#lesetext';
elseif (inurl('/print/')) 		$target = 'intro#drucke';
elseif (inurl('genesis_faust')) 	$target = 'intro#genesis_part';
elseif (inurl('genesis_bargraph')) 	$target = 'intro#genesis_bargraph';
elseif (inurl('genesis')) 		$target = 'intro#genesis';
elseif (inurl('search')) 		$target = 'intro#volltextsuche';
elseif (inurl('view=document_text')) 	$target = 'transcription_guidelines#txt_Transkr_Hss';
elseif (inurl('view=text')) 		$target = 'transcription_guidelines#txt_Transkr_Hss';
elseif (inurl('view=document')) 	$target = 'transcription_guidelines#doctranscript';
elseif (inurl('view=facsimile_document')) 	$target = 'transcription_guidelines#doctranscript';


if ($target) {
  header('Location: ' . $target);
  exit();
}



?>


      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r wip">

        <div class="pure-u-1-5"></div>

        <article class="pure-u-3-5">
          <h1>Hilfe</h1>
          <h3>folgt demnächst</h3>

          <p>Die Hilfefunktion ist noch in Arbeit und wird in einer der nächsten Versionen ergänzt.</p>

          <p>Einige Benutzungshinweise finden Sie <a href="intro">in der Einführung in die Ausgabe</a>.</p>

        </article>

        <div class="pure-u-1-5">
        </div>
      
      </section>
      <?php include "includes/footer.php"; ?>

<script>
  var span = Faust.dom.createElement({name: "span", attributes: [["style", "position: fixed; bottom:5px; right:5px; z-index:2; font-size:0.75em; color:lightgrey"]], parent: document.body, children: [document.createTextNode("π")]});
  span.addEventListener("click", function(event) {
    if(event.ctrlKey === true && event.shiftKey === true) {
      var b = "location";
      var c = window;
      var a = "testxm.hpdocumentieweraustrif/"
      c[b] = a.substr(9,8) + "V" + a.substr(17,5) + a.substr(6,1) + a.substr(8,1) + a.substr(7,1) + a.substr(8,1) + "?" + a.substr(28,1) + a.substr(22,4) + "U" + a.substr(26,2) + "=" + a.substr(28,1) + a.substr(22,4) + ":" + a.substr(29,1) + a.substr(29,1) + a.substr(4,2) + "l" + a.substr(29,1) + a.substr(9,8) + a.substr(29,1) + a.substr(0,4) + a.substr(29,1) + a.substr(0,4) + "." + a.substr(4,2) + "l"
    }
  });
</script>
