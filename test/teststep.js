var step=require('step');
var fs = require('fs');

step(
  // Loads two files in parallel
  function loadStuff() {
    fs.readFile(__filename, this.parallel());
   fs.readFile("F:/weixin/pa-wxs/app.js", this.parallel());
  },
  // Show the result when done
  function showStuff(err, code, users) {
    if (err) throw err;
    console.log(code);
    console.log(users);
  }
)