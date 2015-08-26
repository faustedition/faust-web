<?php header('Content-Type: text/html; charset=utf-8'); ?>
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
    <link rel="stylesheet" href="css/pure-min.css">
    <link rel="stylesheet" href="css/pure-custom.css">
    <link rel="stylesheet" href="css/basic_layout.css">
  </head>
  <body>
    <header>
      <div class="header-content">
        <a class="faustedition-logo" title="Faustedition" href="index.php">
          <img class="faustedition-logo-svg" src="img/faustlogo.svg" alt="Faustedition logo">
        </a>
        <div id="breadcrumbs" class="breadcrumbs">
        </div>
        <nav class="header-navigation pure-menu">
          <a href="archives.php">Archiv</a>
          <a href="chessboard_overview.php">Genese</a>
          <a href="print/text.html">Text</a>
<!--          <input autocomplete="off" id="quick-search" placeholder="Search" type="text"/>-->
        </nav>
      </div>
    </header>
    <main>
      <div class="main-content-container">
