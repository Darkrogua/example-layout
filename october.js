var fs = require('fs');

const cssFileList = [
   'pages/index.html',
];

cssFileList.forEach((fileName) => {
   fs.readFile(fileName, function (err, data) {
      if (err) throw err;
      var array = data.toString().split("\n");
     
      for (i in array) {
         if (array[i].includes('{%')) {
            console.log(array[i]);
            getPartialName(array[i]);
         } 
      }
   });
});

function getPartialName(sLine) {
   let regexp = '/<(.*?)>/g';
   let matchAll = sLine.matchAll(regexp);
   console.log(matchAll);
}

function getPartial() {

}

