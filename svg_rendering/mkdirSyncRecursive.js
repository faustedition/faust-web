// create directories synchronously and recursively.
// parameter dirs (string) takes the dir / path to create.
// if basedir is undefined the dirs will be created
// relative to cwd, otherwise the dirs will be created
// in basedir
var mkdirSyncRecursive = function(dirs, basedir) {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  basedir = basedir || "./";
  basedir = path.resolve(basedir);

  // create array from directory input string
  if(!(dirs instanceof Array)) {
    dirs = dirs.split("/");
  }

  // create basedir, if not given on function call
  if(!fs.existsSync(basedir)) {
    mkdirSyncRecursive(basedir, "/");
  }

  // create directory if not exists
  var currentDir = path.join(basedir, dirs.shift());
  if(!fs.existsSync(currentDir)) {
    fs.mkdirSync(currentDir);
  }

  // if directories are left, create them
  if(dirs.length > 0) {
    mkdirSyncRecursive(dirs, currentDir);
  }
};

module.exports = mkdirSyncRecursive;
