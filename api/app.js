var fs = require("fs");
let header = [];
const util = require('util');
var path = require('path');
var config = require('./config');
var mysql = require("mysql");
var mongo = require('mongodb');
var mongourl = 'mongodb://localhost/gortarchive';
var headerobj = {};
let headerArr;
let entries = [];



function addFile(filename, properties){
  console.log("AddFile");
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    properties['filename'] = filename;
    dbo.collection("gortarchive").insertOne(properties, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

function deleteEntry(filename){
}

function callAdd(filename){
  readHeader(filename, fs.createReadStream(filename, {start: 0, end: 23040})).catch(err => console.error(err));
}

async function readHeader(filename, readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  var rawHeaderText = data;
  var endTag = data.indexOf("END") + 3;
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
   headerArr[i][0] = headerArr[i][0].replace(/\./g,'');
   headerArr[i][0] = headerArr[i][0].replace(/\s/, '');
}
  var headerobjtemp = {};
  for (var i=0, iLen=headerArr.length; i<iLen; i++) {
    headerobjtemp[headerArr[i][0]] = headerArr[i][1];
  }
  headerobj = headerobjtemp;
  addFile(filename, headerobj);
  return headerobj;
}

function parseHeader(rawHeaderText){
}

  function getFiles(dir, done) {
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


  function getEntries(){
    mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) { if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo.collection("gortarchive").find({},{ projection: {_id: 0, filename: 1}}).toArray(function(err, result) {
        let tempresult = [];
        for(var i = 0; i < result.length; i++)
        {
          tempresult.push(result[i]['filename']);
        }
        result = tempresult;
        if (err) throw err;
        db.close();
        syncEntries(tempresult);
      });
    });
  }


function syncEntries(entries){
  getFiles('./img/', function(err, results) {
    if (err) throw err;
    for(var i=0; i < results.length; i++){
      results[i] = results[i].replace(/^(.*?)\img/, 'img');      
    }
    let files = results;
    var toAdd = [];
    var toDelete = [];
    for(var i=0; i<files.length; i++){
      if(!entries.includes(files[i]))
        {
          toAdd.push(files[i]); 
        }
    }
    for(var i=0; i<entries.length; i++){
      if(!files.includes(entries[i]))
        {
          toDelete.push(files[i]); 
        }
    }
    for(var i=0; i<toAdd.length; i++){
       callAdd(toAdd[i]);
    }
  });
}


getEntries();