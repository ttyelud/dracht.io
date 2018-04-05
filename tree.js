const filename = require('file-name')
const fs = require('fs')
const path = require('path')
const marked = require('marked')

function titleCase(str) {
  str = filename(str).replace(/-|_/g, " ");
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function arrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};


function tree(fn) {
  let stats = fs.lstatSync(fn)
  if (path.extname(fn) == '.md' || stats.isDirectory()) {
      var info = {
        filepath: path.relative('./views', fn),
        file: filename(path.basename(fn)),
        name: titleCase(path.basename(fn))
      };

    if (stats.isDirectory()) {
      info.type = "directory";
      info.children = fs.readdirSync(fn).map(function(child) {
          return tree(fn + '/' + child);
      });
    } else {
      info.type = "file";
      if (path.extname(fn) == '.md') {
        info.content = marked(fs.readFileSync(fn, {encoding: 'utf-8'}));
      }
    }

    return info;
  } else {
    return null;
  }
}

module.exports = function (fn) {
  let stats = fs.lstatSync(fn)
  if (path.extname(fn) == '.md' || stats.isDirectory()) {
      var info = {
        filepath: path.relative('./views', fn),
        file: filename(path.basename(fn)),
        name: titleCase(path.basename(fn))
      };

    if (stats.isDirectory()) {
      info.type = "directory";
      info.children = fs.readdirSync(fn).map(function(child) {
          return tree(fn + '/' + child);
      });
    } else {
      info.type = "file";
      if (path.extname(fn) == '.md') {
        info.content = marked(fs.readFileSync(fn, {encoding: 'utf-8'}));
      }
    }

    return info;
  } else {
    return null;
  }
}
