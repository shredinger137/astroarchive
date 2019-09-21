var fs = require("fs");
let header = "header";
const util = require('util');
var path = require('path');
var config = require('./config');
console.log(config.dbname);

async function readHeader(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    parseHeader(data);
  }

 // readHeader(fs.createReadStream('./img/test1.fts', {start: 0, end: 23040})).then(data => {header = data; }).catch(err => console.error(err))

function parseHeader(rawHeaderText){
    var endTag = rawHeaderText.indexOf("END") + 3;
    rawHeaderText = rawHeaderText.substr(0, endTag);
    var regex1 = RegExp('.{80}','g');
    var regex2 = RegExp('\s*=\s*');
    var headerArr = [];
    var array1;
    while ((array1 = regex1.exec(rawHeaderText)) !== null) {
       headerArr.push(array1[0]);
     }
    for(var i=0; i < headerArr.length; i++){
     headerArr[i] = headerArr[i].replace(/\s\s+/g, ' ');
     headerArr[i] = headerArr[i].replace(/\/.*/, '');
     headerArr[i] = headerArr[i].split(regex2);
       // rawHeaderText[i] = rawHeaderText[i].split("=");
  }

     console.log(util.inspect(headerArr, {'maxArrayLength': null}));

  }
  
  function getFiles(){
      fs.readdir('./img/', function(err, items) {
        console.log(items);

        for (var i=0; i<items.length; i++) {
            console.log(items[i]);
        }
    });
  }

  var getFiles = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var pending = list.length; if(!pending)done(null, results); 
      if (!pending) return done(null, results);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            getFiles(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
  };

  getFiles('./img/', function(err, results) {
    if (err) throw err;
    for(var i=0; i < results.length; i++){
      results[i] = results[i].replace(/^(.*?)\img/, '');      
    }
    console.log(results);
  });

