var fs = require("fs");
let header = [];
const util = require('util');
var path = require('path');
var config = require('./config');
var mysql = require("mysql");
var mongo = require('mongodb');
var mongourl = 'mongodb://localhost/gortarchive';
var headerobj = {};

mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
 var dbo = db.db("gortarchive");
  var cursor = dbo.collection('gortarchive').find({},{filename: 1 });
  cursor.each(function(err, doc) {

     // console.log(doc);

  });
}); 

function addFile(filename, properties){
  console.log("AddFile");
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    console.log("Properties:" + properties[4]);
    properties['filename'] = filename;
    properties['test'] = "test";
    dbo.collection("gortarchive").insertOne(properties, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });


}


async function readHeader(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    var endTag = data.indexOf("END") + 3;
    data = data.substr(0, endTag);
    var regex1 = RegExp('.{80}','g');
    var regex2 = RegExp('\s*=\s*');
    var headerArr = [];
    var array1;
    while ((array1 = regex1.exec(data)) !== null) {
       headerArr.push(array1[0]);
     }
    for(var i=0; i < headerArr.length; i++){
     headerArr[i] = headerArr[i].replace(/\s\s+/g, ' ');
     headerArr[i] = headerArr[i].replace(/./g, '');
     headerArr[i] = headerArr[i].replace(/\/.*/, '');
     headerArr[i] = headerArr[i].split(regex2);
     headerArr[i][0] = headerArr[i][0].replace(/\s/, '');

  }
    
    for (var i=0, iLen=headerArr.length; i<iLen; i++) {
      headerobj[headerArr[i][0]] = headerArr[i][1];
    }

    header = headerobj;
    console.log(headerobj);
    addFile('filenametest', headerobj);
    return headerobj;
    
  }


function parseHeader(rawHeaderText){


  }
  
  function getFiles(){
      fs.readdir('./img/', function(err, items) {
       // console.log(items);

        for (var i=0; i<items.length; i++) {
         //   console.log(items[i]);
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
            if (file.indexOf("fts")){
              results.push(file);
              if (!--pending) done(null, results);
            }
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
  });

  readHeader(fs.createReadStream('img/test1.fts', {start: 0, end: 23040})).then(data => {console.log(header)}).catch(err => console.error(err));
