<?php
  header('Content-Type: text/html; charset=utf-8');
  
  function inurl($substring) { 
    $request = $_SERVER['REQUEST_URI'];

    if ($_SERVER['REQUEST_URI'] == '/' && $substring == 'index') return true;
    else return strpos($request, $substring) !== false; 
  }

  if (!isset($showFooter)) $showFooter = true;

  $classes = array();
  if (!$showFooter) array_push($classes, 'nofooter');
  if (inurl('documentViewer')) array_push($classes, 'document');
  /* if (inurl('bargraph')) array_push($classes, 'bargraph'); */
?>
<!DOCTYPE HTML>
<html>
  <head>
    <meta charset='utf-8'>
    <title>Faustedition [beta.3]</title>

    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/sortable.min.js"></script>
    <script type="text/javascript" src="js/faust_common.js"></script>

    <link rel="stylesheet" href="css/webfonts.css">
    <link rel="stylesheet" href="css/pure-min.css">
    <link rel="stylesheet" href="css/pure-custom.css">
    <link rel="stylesheet" href="css/basic_layout.css">
    <link rel="stylesheet" href="css/chocolat.css">
    <link rel="stylesheet" href="css/chocolat-custom.css">
    <?php if (inurl('documentViewer')) : ?>
    <link rel="stylesheet" href="css/document-viewer.css">
    <link rel="stylesheet" href="css/document-text.css">
    <link rel="stylesheet" href="css/document-transcript.css">
    <link rel="stylesheet" href="css/document-transcript-highlight-hands.css">
    <link rel="stylesheet" href="css/document-transcript-interaction.css">
    <link rel="stylesheet" href="css/textual-transcript.css">
    <link rel="stylesheet" href="css/prints-viewer.css">
    <?php endif; ?>
    <?php if (inurl('genesis')) : ?>
    <link rel="stylesheet" href="css/genesis-bargraph.css">
    <?php endif; ?>
    <?php if (inurl('index')) : ?>
    <link rel="stylesheet" href="css/slick.css">
    <link rel="stylesheet" href="css/slick-custom.css">
    <?php endif; ?>
    
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
  </head>
  <body>
    <header>
        <div class="logo">
          <a href="/"><img src="img/faustlogo.svg" alt="Faustedition"></a>
          <sup class="pure-fade-50"><mark>beta.3</mark></sup>
        </div>
        <div class="breadcrumbs pure-right pure-nowrap pure-noprint pure-fade-50">
          <small id="breadcrumbs"></small>
        </div>
        <div id="current" class="pure-nowrap"></div>
        <nav id="nav_all" class="pure-menu pure-menu-open pure-menu-horizontal pure-right pure-nowrap pure-noprint">
          <ul>
          <li id="nav_archive"><a href="archive">Archiv</a></li>
          <li id="nav_genesis"><a href="genesis">Genese</a></li>
          <li id="nav_text"><a href="text">Text</a></li>
          <li><form class="pure-form" action="/search" method="GET"><input id="quick-search" name="q" type="text" onblur="this.value=''" /><button type="submit" class="pure-fade-30"><i class="fa fa-search fa-lg"></i></button></form></li> 
          <li id="imprint_sitemap">
            <small class="pure-fade-50">
              <a href="imprint">Impressum</a>
              <a href="intro#sitemap">Sitemap</a>
            </small>
          </li>
          <li><a href="help"><i class="fa fa-help-circled fa-lg"></i></a></li>
          </ul>
        </nav>
    </header>
    <main class="<?php echo implode(' ', $classes); ?>">
