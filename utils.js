const filename = require('file-name');
const fs = require('fs');
const path = require('path');
const config = require('config');
const marked = require('marked');
const _ = require('lodash');
const obj = module.exports = {};

function titleCase(str) {
  str = filename(str).replace(/-|_/g, ' ');
  return str.replace(/\w\S*/g, (txt) => {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const activeOrder = [];
function pushActiveOrder(ao) {
  activeOrder.push(ao);
}
function getActiveOrder() {
  if (activeOrder.length) return activeOrder[activeOrder.length - 1];
}
function popActiveOrder() {
  activeOrder.pop();
}
function hasActiveOrder() {
  return activeOrder.length > 0 && getActiveOrder();
}

obj.mdTree = function(baseDir, relativeDir) {

  function processTree(p) {
    const stats = fs.lstatSync(p);
    if (path.extname(p) === '.md' || stats.isDirectory()) {
      const obj = {
        filepath: path.relative(relativeDir, p),
        file: filename(path.basename(p)),
        name: titleCase(path.basename(p)),
        order: 999
      };
      const arr = /^(?:(\d+)-)?(.*?)(\..*)?$/.exec(path.basename(p));
      if (arr) {
        obj.file = arr[2];
        if (arr[1]) obj.order = parseInt(arr[1]);
        if (arr[2]) obj.name = titleCase(arr[2]);
      }

      if (hasActiveOrder()) {
        const ao = getActiveOrder();
        const idx = ao.indexOf(obj.file);
        if (idx !== -1) obj.order = idx;
      }
      if (stats.isDirectory()) {
        if (config.has(`md.${obj.file}`)) pushActiveOrder(config.get(`md.${obj.file}`));
        else pushActiveOrder(null);

        obj.children = fs.readdirSync(p)
          .map((child) => processTree(`${p}/${child}`))
          .filter((o) => o);
        popActiveOrder();
      }
      else {
        obj.content = marked(fs.readFileSync(p, {encoding: 'utf8'}));
      }

      return obj;
    }
    return null;
  }

  function orderTree(t) {
    if (t.children && t.children.length) {
      t.children = _.sortBy(t.children, ['order']);
      t.children.forEach((c) => orderTree(c));
    }
    return t;
  }

  const obj = orderTree(processTree(baseDir));

  return obj;
};

