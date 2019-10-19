let header = [];
var config = require('./config');
var mongo = require('mongodb');
var mongourl = 'mongodb://localhost/gortarchive';
var express=require('express');
var app = express();
const AdmZip = require('adm-zip');


app.get('/downloadAll', function(req, res){
    var data = [];
    res.statusCode = 200;
    var query = {};
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
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
        _id: 0, filename: 1}}).sort( {DATEOBS: -1} ).toArray(function(err, result) {
        if (err) {
          throw err
        }
  
        if (result) {
          const zip = new AdmZip();
          for(var i=0; i<result.length; i++){
            zip.addLocalFile(result[i]['filename']);
          }
          const downloadName = `${Date.now()}.zip`;
          const data = zip.toBuffer();
          res.set('Content-Type','application/octet-stream');
          res.set('Content-Disposition',`attachment; filename=${downloadName}`);
          res.set('Content-Length',data.length);
          res.send(data);
          
          ;};
      });
    });
  });
  app.listen(3002)