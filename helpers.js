const fs = require('fs')
const path = require('path')

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

module.exports = {
  order : function(t, c, cb) {
    var arr = t;
    for (var k = 0; k < arr.length; k++) {
      for (var i = 0; i < arr[k].children.length; i++) {
        if (t[k].file in c) {
          for (var j = 0; j < c[arr[k].file].length; j++) {
            if (arr[k].children[i].file == c[arr[k].file][j]) {
              arrayMove(arr[k].children, i, j)
            }
          }
        }
      }
    }
    cb(arr)
  }
};
