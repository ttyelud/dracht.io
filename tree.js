const filename = require('file-name')
const fs = require('fs')
const path = require('path')
const marked = require('marked')

function titleCase(str) {
  str = filename(str).replace(/-|_/g, " ");
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function tree(fn) {
  let stats = fs.lstatSync(fn),
    info = {
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
}

module.exports = function (fn) {
  let stats = fs.lstatSync(fn),
    info = {
      filepath: path.relative('./views', fn),
      file: filename(path.basename(fn)),
      name: titleCase(path.basename(fn))
    };
  console.log(fn)
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
}
