<?php
  header('Content-Type: text/html; charset=utf-8');
  $showFooter = true; // can be set in content pages
?>
<!DOCTYPE HTML>
<html>
  <head>
    <meta charset='utf-8'>
    <title>Digitale Faust-Edition</title>

    <script type="text/javascript" src="data/archives.js"></script>
    <script type="text/javascript" src="data/concordance_columns.js"></script>
    <script type="text/javascript" src="data/document_metadata.js"></script>
    <script type="text/javascript" src="data/genetic_bar_graph.js"></script>
    <script type="text/javascript" src="data/scene_line_mapping.js"></script>

    <script type="text/javascript" src="js/faust_common.js"></script>

    <link rel="stylesheet" href="css/document-text.css">
    <link rel="stylesheet" href="css/document-transcript.css">
    <link rel="stylesheet" href="css/document-transcript-highlight-hands.css">
    <link rel="stylesheet" href="css/document-transcript-interaction.css">
    <link rel="stylesheet" href="css/webfonts.css">
    <link rel="stylesheet" href="css/fontawesome-min.css">
    <link rel="stylesheet" href="css/pure-min.css">
    <link rel="stylesheet" href="css/pure-custom.css">
    <link rel="stylesheet" href="css/basic_layout.css">
    <link rel="stylesheet" href="css/slick.css">

    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
	<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
  </head>
  <body>
    <header>
        <div class="logo">
          <a href="/" title="Faustedition"><img src="img/faustlogo.svg" alt="Faustedition"></a>
        </div>
        <div class="breadcrumbs pure-right pure-nowrap pure-fade-50">
          <small id="breadcrumbs"></small>
        </div>
        <div id="current" class="pure-nowrap"></div>
        <nav class="pure-menu pure-menu-open pure-menu-horizontal pure-right pure-nowrap pure-noprint">
          <ul>
          <li><a href="archives.php">Archiv</a></li>
          <li><a href="genesis.php">Genese</a></li>
          <li><a href="print/text.html">Text</a></li>
          <li><form class="pure-form"><input autocomplete="off" id="quick-search" placeholder="Suche" type="text"/></form></li> 
          <li><a href="imprint.php"><small class="pure-fade-50">Impressum</small></a></li>
          <li><a href="help.php"><i class="fa fa-question-circle fa-lg"></i></a></li>
          </ul>
        </nav>
    </header>
    <main>
