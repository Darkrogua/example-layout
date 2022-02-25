
const path = require('path');
var fs = require('fs');

const cssFileList = [
   'pages/index.html',
];

let fileContent = [];

cssFileList.forEach((fileName) => {
   fs.readFile(fileName, function (err, data, fileContent) {
      if (err) throw err;
      var array = data.toString().split("\n");
      fileContent = array;
      for (i in array) {
         if (array[i].includes('{%')) {
            let promise = new Promise(function (resolve, reject) {
               fileContent[i] = getPartial(array[i]);
            });
         } 
      }
      console.log('test' + fileContent);
   });



   //fs.appendFile(path.join(__dirname, 'public/pages/index.html'), fileContent, function (err) {
   //   if (err) throw err;
   //   console.log('File создан где-то');
   //});
});


function getPartialName(sLine) {
   let regexp = /'([^']+)'/gm;
   let matchAll = regexp.exec(sLine);
   return matchAll[1];
}


function getPartial(fullString) {
   let partialName = getPartialName(fullString);
   if (partialName) {
    return getInnerPartial(partialName+'.htm');
   }
   return 'lox';
}

function getInnerPartial(partialName) {
   fs.readFile(path.join(__dirname, partialName), 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      return data;
   });
}