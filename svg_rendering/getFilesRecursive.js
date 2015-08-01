// function to get all files from a directory recursively. function is implemented synchroniously, so if processing
// of large amounts of files is necessary it should be rewritten.
// the function can be configured to return or ignore files or directories. if a filter object is supplied, only
// files having an extension that equals a property of the filter object are returned
var getFilesRecursive = function(startDir, conf) {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  conf = conf || {};

  var getFiles = function(dir) {
    var result = [];
    var files, file, fileExtension;
    var stat;
    var i;

    files = fs.readdirSync(dir);
    // process all files from current dir
    for(i = 0; i < files.length; i++) {
      file = path.join(dir, files[i]);
      // get information on current file
      stat = fs.statSync(file);
      // if file actually is a file, process it, i.e. only return if file extension is member of filter obj
      if(stat.isFile() === true) {
        if(conf.returnFiles === true) {
          fileExtension = file.lastIndexOf(".") !== -1 ? file.substr(file.lastIndexOf(".") + 1) : undefined;
          if(conf.filter !== undefined && fileExtension !== undefined && conf.filter[fileExtension] === true) {
            result.push(file);
          } else if(conf.filter === undefined) {
            // if no filter object is supplied, always return file
            result.push(file);
          }
        }
      } else if (stat.isDirectory() === true) {
        // process directories
        if(conf.returnDirs === true) {
          // add directory to return set, if desired
          result.push(file);
        }
        // process subdirectories
        result = result.concat(getFiles(file));
      }
    }

    return result;
  };

  return getFiles(startDir);
};

module.exports = getFilesRecursive;
