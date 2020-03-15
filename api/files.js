var config = require("./config.js")
var mongo = require("mongodb");
var mongourl = "mongodb://localhost/gortarchive";
var express = require("express");
var app = express();
var archiver = require("archiver");

app.get("/", function(req, res) {
  var archive = archiver("zip", {
    zlib: { level: 6 } 
  });

  var path = (__dirname).replace(/api$/, '');
  var path = config.imagepath;
  //console.log("Path: " + path);
  var name = Math.random().toString(36).substring(2, 15);
  var file = __dirname + "/ziptemp/" + name + ".zip";

  archive.on('error', function(err) {
    res.status(500).send({error: err.message});
  });

  archive.on('end', function() {
    //console.log('Archive wrote %d bytes', archive.pointer());
  });

  res.attachment(file);
  archive.pipe(res);

  res.statusCode = 200;
  var query = {};
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.query.dateFrom && req.query.dateTo) {
    query["DATEOBS"] = { $gte: +req.query.dateFrom, $lte: +req.query.dateTo };
  } else {
    if (req.query.dateFrom) {
      query["DATEOBS"] = { $gte: +req.query.dateFrom };
    }
    if (req.query.dateTo) {
      query["DATEOBS"] = { $lte: +req.query.dateTo };
    }
  }

    if (req.query.user) {
      query["USER"] = req.query.user;
    }
    if (req.query.filter) {
      query["FILTER"] = req.query.filter;
    }
  

  if (req.query.object) {
    query["OBJECT"] = req.query.object;
  }

  console.log("File query: " + query);

  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("gortarchive")
        .find(query, {
          projection: {
            _id: 0,
            filename: 1
          }
        })
        .limit(150)
        .toArray(function(err, result) {
          if (err) {
            //console.log(err);
          }
          if (result) {
            //console.log(__dirname);
            for (var i = 0; i <= result.length; i++) {
              if (result[i] && result[i].filename) {
                archive.file(path + result[i].filename, {
                  name: (result[i].filename).replace('img', '')
                });
              }
            }
            archive.finalize();
          }
        });
    }
  );
});

app.listen(3005);
