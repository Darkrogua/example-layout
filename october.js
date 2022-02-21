var fs = require('fs');

const cssFileList = [
   'pages/index.html',
];

cssFileList.forEach((fileName) => {
   fs.readFile(fileName, function (err, data) {
      if (err) throw err;
      var array = data.toString().split("\n");
      for (i in array) {
         console.log(array[i]);
      }
   });
});





