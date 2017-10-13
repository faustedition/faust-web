<?php
  header('Content-Type: text/html; charset=utf-8');
  
  function inurl($substring) { 
    $request = $_SERVER['REQUEST_URI'];

    if ($request == '/' && $substring == 'index') return true;
    else return strpos($request, $substring) !== false; 
  }

  $classes = array();
  if (inurl('documentViewer')) array_push($classes, 'document');
  /* if (inurl('bargraph')) array_push($classes, 'bargraph'); */

  $base = explode('/', parse_url($_SERVER['REQUEST_URI'])['path'])[1];
  array_push($classes, $base);
?>
<!DOCTYPE HTML>
<html>
  <head>
    <meta charset='utf-8'>
    <title>Faustedition [alpha]</title>

    <script type="text/javascript" src="js/require.js"></script>

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
  <body class="<?php echo implode(' ', $classes); ?>">
    <header>
        <div class="logo">
          <a href="/"><img src="img/faustlogo.svg" alt="Faustedition"></a>
          <sup class="pure-fade-50"><mark>alpha</mark></sup>
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
          <li><a href="help"><i class="fa fa-help-circled fa-lg"></i></a></li>
          </ul>
        </nav>
    </header>
    <main class="<?php echo implode(' ', $classes); ?>">
