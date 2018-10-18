<?php

# When we're here, trailing slash is always wrong
$path_fragment = $_SERVER['REQUEST_URI'];
if (substr($path_fragment, -1) === "/") {
    header('Location: ' . substr($path_fragment, 0, strlen($path_fragment)-1));
    http_response_code(301);
    die();
}

# do we have a html file named like this?
$path = "content" . $path_fragment . ".html";
if (!file_exists($path)) {
    $basename = substr($path_fragment, 1);

    # has someone used / for paths?
    if ($basename === 'project/about') {
        # this is out in the wild, but isn't recognized in .htaccess
        $fixed_base = 'intro';
    } else {
        $fixed_base = str_replace('/', '_', $basename);
    }
    $alt_path = "content/" . $fixed_base . ".html";
    if (file_exists($alt_path)) {
        header('Location: /' . $fixed_base);
        http_response_code(301);
        die();
    } else {
        http_response_code(404);
        $status = 404;
        include "error.php"  ;
        die();
    }
}

include "includes/header.php";
include $path;
include "includes/footer.php"; ?>
