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
?>
<!DOCTYPE HTML>
<html>
  <head>
    <meta charset='utf-8'>
    <title>Faust-Edition [beta]</title>

    <script type="text/javascript" src="js/faust_common.js"></script>

    <link rel="stylesheet" href="css/webfonts.css">
    <link rel="stylesheet" href="css/pure-min.css">
    <link rel="stylesheet" href="css/pure-custom.css">
    <link rel="stylesheet" href="css/basic_layout.css">
    <?php if (inurl('documentViewer')) : ?>
    <link rel="stylesheet" href="css/document-text.css">
    <link rel="stylesheet" href="css/document-transcript.css">
    <link rel="stylesheet" href="css/document-transcript-highlight-hands.css">
    <link rel="stylesheet" href="css/document-transcript-interaction.css">
    <link rel="stylesheet" href="css/textual-transcript.css">
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
          <a href="/" title="Faustedition"><img src="img/faustlogo.svg" alt="Faustedition"></a>
          <sup class="pure-fade-50"><mark>beta</mark></sup>
        </div>
        <div class="breadcrumbs pure-right pure-nowrap pure-fade-50">
          <small id="breadcrumbs"></small>
        </div>
        <div id="current" class="pure-nowrap"></div>
        <nav class="pure-menu pure-menu-open pure-menu-horizontal pure-right pure-nowrap pure-noprint">
          <ul>
          <li><a href="archive">Archiv</a></li>
          <li><a href="genesis">Genese</a></li>
          <li><a href="print/text">Text</a></li>
          <li><form class="pure-form" action="/search" method="GET"><input id="quick-search" name="q" type="text" onblur="this.value=''" /><button type="submit" class="pure-fade-30"><i class="fa fa-search fa-lg"></i></button></form></li> 
          <li><a href="imprint"><small class="pure-fade-50">Impressum</small></a></li>
          <li><a href="help"><i class="fa fa-help-circled fa-lg"></i></a></li>
          </ul>
        </nav>
    </header>
    <main class="<?php echo implode(' ', $classes); ?>">
