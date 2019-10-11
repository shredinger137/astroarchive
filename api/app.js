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
var http = require('http');
var cors = require('cors');
var express=require('express');
var app = express();
var cron = require('node-cron');
var page = 0;
var count = 50;
var query = {};

cron.schedule('* 5 * * *', () => {
 getEntries();
});
//AAAAAH
//TODO: Turn filters into an encoded object. Include pages. Pass it in URI from frontend.
//GENERALIZE AND SHIT.

app.get('/', function(req, res){
  var data = [];
  var page = 0;
  var perpage = 10000;
  res.statusCode = 200;
  var query = {};
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if(req.query.page){
    var page = req.query.page - 1;
      if(req.query.perpage){
        perpage = parseInt(req.query.perpage);
      }
  }
  
  if(req.query.dateFrom && req.query.dateTo){
    query['DATEOBS'] = {$gte: +req.query.dateFrom, $lte: +req.query.dateTo};
  } else {
    if(req.query.dateFrom){
      query['DATEOBS'] = {$gte: +req.query.dateFrom};
    }
    if(req.query.dateTo){
      query['DATEOBS'] = {$lte: +req.query.dateTo};
    }
  }

  if(req.query.object){
    query['OBJECT'] = req.query.object;
  }

  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    dbo.collection("gortarchive").find(query,{ projection: {
      _id: 0, filename: 1, OBJECT: 1, FILTER: 1, DATEOBS: 1, AZIMUTH: 1, ALTITUDE: 1, CCDTEMP: 1, OBSERVER: 1, EXPTIME: 1
    }}).sort( {DATEOBS: -1} ).skip(page * perpage).limit(perpage).toArray(function(err, result) {
      if (err) {
        throw err
      }

      if (result) {
        data.push(result);
        dbo.collection("gortarchive").find(query,{}).count(function(err, countres) {
          if (err) {
            throw err
          }
          if (countres) {
            res.send({'count': countres, 'items': result});
          }
        }     
        )};
    });
  });
});


app.get('/stats', function(req, res){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    dbo.collection("stats").find({},{}).toArray(function(err, result) {
      if (err) {
        throw err
      }

      if (result) {
        res.send({result});
      };
    });
  });
});



function addFile(filename, properties){
  if(filename.indexOf('Dark') > 0){
    properties['OBJECT'] = "Calibration/Dark";
  }
  if(filename.indexOf('Bias') > 0){
    properties['OBJECT'] = "Calibration/Bias";
  }
  
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    properties['filename'] = filename;
    
    dbo.collection("gortarchive").insertOne(properties, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted, " + filename);
      db.close();
    });
  });

}

function deleteEntry(filename){
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    var myquery = { filename: filename};
    dbo.collection("gortarchive").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      db.close();
    });
  });
}

function callAdd(filename){
  readHeader(filename, fs.createReadStream(filename, {start: 0, end: 23040})).catch(err => console.error(err));
}


//This is kind of an important function. Here we parse the header, create the object
//and otherwise prep it to be added to the database. A bunch of string cleaning and
//conversions happen along the way. This will remove descriptions and only
//retain key/value pairs.

async function readHeader(filename, readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  var rawHeaderText = data;
  var endTag = data.indexOf("END") + 3;
  rawHeaderText = rawHeaderText.substr(0, endTag);
  var regex1 = RegExp('.{80}','g'); //FTS files have 80 byte lines, so we split by lines first
  var regex2 = RegExp('\s*=\s*');  //Our files have something = something on each relevant line, so we split that
  var headerArr = [];
  var array1;
  while ((array1 = regex1.exec(rawHeaderText)) !== null) {
     headerArr.push(array1[0]);
   }
  for(var i=0; i < headerArr.length; i++){
   headerArr[i] = headerArr[i].replace(/\s\s+/g, ' ');
   headerArr[i] = headerArr[i].replace(/\/.*/g, '').trim();
   headerArr[i] = headerArr[i].split(regex2);
   headerArr[i][0] = headerArr[i][0].replace(/\.*\s*\-*/g,''); 
   headerArr[i][0] = headerArr[i][0].replace(/-/g, ''); //dashes in keys will break queries
   headerArr[i][0] = headerArr[i][0].replace(/\s/g, '').trim();
   
   if (!headerArr[i][1]){ //this conditional eliminates descriptors without values, which some software adds in
     headerArr.splice(i,1);
   } else {
     headerArr[i][1] = headerArr[i][1].replace(/^\s+|\s+$/gm,'');
     headerArr[i][1] = headerArr[i][1].replace(/\s*'/gm, '').trim();
   }

   if(headerArr[i][0].indexOf("DATE") > -1){
    var timestamp = new Date(headerArr[i][1] + "Z");
    headerArr[i][1] = (timestamp.getTime());
  }
}
  var headerobjtemp = {};

  //Below, we need to convert our two dimensional array into an object MongoDB can understand
  for (var i=0, iLen=headerArr.length; i<iLen; i++) {
    if(headerArr[i][0] && headerArr[i][1]){    
    headerobjtemp[headerArr[i][0]] = headerArr[i][1]; }
  }
  headerobj = headerobjtemp;
  if(headerobj['filename'] != ""){ 
  addFile(filename, headerobj); }
  return headerobj;
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
             results.push(file);
              if (!--pending) done(null, results);
            }
        });
      });
    });
  };


  function getEntries(){
    mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) { 
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo.collection("gortarchive").find({},{ projection: {_id: 0, filename: 1, OBJECT: 1}}).toArray(function(err, result) {
        let tempresult = [];
        for(var i = 0; i < result.length; i++)
        {
          tempresult.push(result[i]['filename']);
        }
        if (err) throw err;
        db.close();
        syncEntries(tempresult);
        makeStats(result);
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
          if(files[i].indexOf('fts') > -1){
          toAdd.push(files[i]); }
        }
    }
    for(var i=0; i<entries.length; i++){
      if(!files.includes(entries[i]))
        {
          toDelete.push(entries[i]); 
        }
    }
    for(var i=0; i<toAdd.length; i++){
      callAdd(toAdd[i]);
    }
    for(var i=0; i<toDelete.length; i++){
      deleteEntry(toDelete[i]);
    }});
}

function makeStats(entries){
  var stats = {};
  var objects = [];
  var objects_clean = [];
  for(var i=0; i<entries.length; i++)
  {
    objects.push(entries[i]['OBJECT']);
  }
  for(var i=0; i<objects.length;i++){
    if(objects[i] && objects_clean.indexOf(objects[i]) < 0){
      objects_clean.push(objects[i])
    } 
  }
  stats = {
    'name': 'objects',
    'objects': objects_clean 
  };
  mongo.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("gortarchive");
    dbo.collection("stats").replaceOne(
      {"name" : "objects"},
      stats,
      {upsert: true}
    );
}
);
  }

getEntries();  //Sync database on app restart. Pretty convenient to have here.
app.listen(3001)