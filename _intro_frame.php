<?php include "includes/header.php";

$path = "content" . $_SERVER['REQUEST_URI'] . ".html";
include $path;

include "includes/footer.php"; ?>
