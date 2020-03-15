var fs = require("fs");
var path = require("path");
var mongo = require("mongodb");
var mongourl = "mongodb://localhost/gortarchive";
var headerobj = {};
var express = require("express");
var app = express();
var cron = require("node-cron");
const https = require('https');
bodyParser = require('body-parser');
app.use(bodyParser.json());


//Call periodic functions to sync the database. Note that the data
//is assumed to be there, we do that part of the sync separately.

cron.schedule("* 5 * * *", () => {
  getEntries();
  getObjectData();
  

});

/**********************************
********* Routes *****************/


app.get("/", function(req, res) {
  var data = [];
  var page = 0;

  //perpage should probably start empty
  var perpage = 100000;
  res.statusCode = 200;
  var query = {};
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.query.page) {
    var page = req.query.page - 1;
    if (req.query.perpage) {
      perpage = parseInt(req.query.perpage);
    }
  }

  if (req.query.fullquery){
    //take full query parameters, decode, make an object
    //this doesn't currently have a matching bit on the other side
    //and exists entirely for testing
  }

  if (req.query.dateFrom && req.query.dateTo) {
    query["DATEOBS"] = { $gte: +req.query.dateFrom, $lte: +req.query.dateTo };
  } else {
    if (req.query.dateFrom) {
      query["DATEOBS"] = { $gte: +req.query.dateFrom };
    }
    if (req.query.dateTo) {
      query["DATEOBS"] = { $lte: +req.query.dateTo };
    } }
    if (req.query.user) {
      query["USER"] = req.query.user;
    }
    if (req.query.filter) {
      query["FILTER"] = req.query.filter;
    }
  

  if (req.query.object) {
    query["OBJECT"] = req.query.object;
  }

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
            filename: 1,
            OBJECT: 1,
            FILTER: 1,
            DATEOBS: 1,
            CCDTEMP: 1,
            USER: 1,
            EXPTIME: 1
          }
        })
        .sort({ DATEOBS: -1 })
        .skip(page * perpage)
        .limit(perpage)
        .toArray(function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            if (result.length !== 0) {
              data.push(result);
              dbo
                .collection("gortarchive")
                .find(query, {})
                .count(function(err, countres) {
                  if (err) {
                  }
                  if (countres) {
                    res.send({ count: countres, items: result });
                  }
                });
            } else {
              res.send({ count: 0 });
            }
          }
        });
    }
  );
});

//Despite the name, /stats provides list data, rather than full breakdowns. May be added to later.

app.get("/stats", function(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("stats")
        .find({name: "lists"}, {})
        .toArray(function(err, result) {
          if (err) {
            throw err;
          }

          if (result) {
            res.send({ result });
          }
        });
    }
  );

});

//TODO: Create a method to take a general query (JSON type)
//Destructure response to create database query.
//This will replace to specified searches currently used in the main API.

app.get("/advanced", function(req, res) {
  var data = [];
  var query = req.query;
  console.log("query");
  console.log(req.query);
  var page = 0;
  var perpage = 150;
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("gortarchive")
        .find(req.query, {
          projection: {
            _id: 0,
            filename: 1,
            OBJECT: 1,
            FILTER: 1,
            DATEOBS: 1,
            CCDTEMP: 1,
            USER: 1,
            EXPTIME: 1
          }
        })
        .sort({ DATEOBS: -1 })
        .skip(page * perpage)
        .limit(perpage)
        .toArray(function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            console.log(result);
            if (result.length !== 0) {
              data.push(result);
              console.log(data);
              dbo
                .collection("gortarchive")
                .find(query, {})
                .count(function(err, countres) {
                  if (err) {
                    console.log(err);
                  }
                  if (countres) {
                    res.send({ count: countres, items: result });
                    
                  }
                });
            } else {
              res.send({ count: 0 });
              console.log("zero");
              
            }
          } else {console.log("no result");}
        });
    }
  );
});

// /fullstats is used for the /stats page and reports comprehensive data on archive objects.

app.get("/fullstats", function(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("stats")
        .findOne({name: "reporting"}, {projection: { _id: 0}}, function(err, result)
         {
          if (err) {
            throw err;
          }
          if (result) {
            mongo.connect(
              mongourl,
              { useNewUrlParser: true, useUnifiedTopology: true },
              function(err, db) {
                if (err) throw err;
                var dbo = db.db("gortarchive");
                dbo
                  .collection("objectData")
                  .find({}, {projection: { _id: 0}})
                  .toArray(function(err, objectData) {
                    if (err) {
                      throw err;
                    }
          
                    if (objectData) {
                      var totalResult = {};
                      totalResult["objectData"] = objectData;
                      totalResult["fullStats"] = result;
                      res.send( totalResult );
                    } else {res.send("object data failed");}
                  });
              }
            );
          //  res.send({ result });
          }
        });
    }
  );
});

//Get data on objects. This is used to, for example, find all binaries.

app.get("/objectsearch", function(req, res) {
  var query = {};
  if(req && req.query && req.query.type){
    query[req.query.type] = true;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("objectData")
        .find(query, {})
        .toArray(function(err, result) {
          if (err) {
            throw err;
          }

          if (result) {
            res.send({ result });
          }
        });
    }
  );

});


/**********************************
*********Operational Functions*****
/**********************************/


function addFile(filename, properties) {
  if (filename.indexOf("Dark") > 0) {
    properties["OBJECT"] = "Calibration/Dark";
  }
  if (filename.indexOf("Bias") > 0) {
    properties["OBJECT"] = "Calibration/Bias";
  }

  //This part is specific to how we have directories set up. All captured images
  //are under ./img/$USER/dates/file.fts, and things under ACP were captured directly
  //from the telescope without using the scheduling software. The lines under here
  //should be removed if you're using a header property instead, or changed for different
  //organizational plans.

  var user = filename.match(/(?<=img\\|\/)([A-Za-z]*)(?=\\|\/)/g);
  if (user) {
    properties["USER"] = user[0];
  }
  if (properties["USER"] == "ACP") {
    properties["USER"] = "GORT Staff";
  }

  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      properties["filename"] = filename;

      dbo.collection("gortarchive").insertOne(properties, function(err, res) {
        if (err) throw err;
       // console.log("1 document inserted, " + filename);
        db.close();
      });
    }
  );
}

function deleteEntry(filename) {
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      var myquery = { filename: filename };
      dbo.collection("gortarchive").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        db.close();
      });
    }
  );
}

function callAdd(filename) {
  readHeader(
    filename,
    fs.createReadStream(filename, { start: 0, end: 23040 })
  ).catch(err => console.error(err));
}

//This is kind of an important function. Here we parse the header, create the object
//and otherwise prep it to be added to the database. A bunch of string cleaning and
//conversions happen along the way. This will remove descriptions and only
//retain key/value pairs.

async function readHeader(filename, readable) {
  readable.setEncoding("utf8");
  let data = "";
  for await (const chunk of readable) {
    data += chunk;
  }
  var rawHeaderText = data;
  var endTag = data.indexOf("END") + 3;
  rawHeaderText = rawHeaderText.substr(0, endTag);
  var regex1 = RegExp(".{80}", "g"); //FTS files have 80 byte lines, so we split by lines first
  var regex2 = RegExp("s*=s*"); //Our files have something = something on each relevant line, so we split that
  var headerArr = [];
  var array1;
  while ((array1 = regex1.exec(rawHeaderText)) !== null) {
    headerArr.push(array1[0]);
  }
  for (var i = 0; i < headerArr.length; i++) {
    headerArr[i] = headerArr[i].replace(/\s\s+/g, " ");
    headerArr[i] = headerArr[i].replace(/\/.*/g, "").trim();
    headerArr[i] = headerArr[i].split(regex2);
    headerArr[i][0] = headerArr[i][0].replace(/\.*\s*\-*/g, "");
    headerArr[i][0] = headerArr[i][0].replace(/-/g, ""); //dashes in keys will break queries
    headerArr[i][0] = headerArr[i][0].replace(/\s/g, "").trim();

    if (!headerArr[i][1]) {
      //this conditional eliminates descriptors without values, which some software adds in
      headerArr.splice(i, 1);
    } else {
      headerArr[i][1] = headerArr[i][1].replace(/^\s+|\s+$/gm, "");
      headerArr[i][1] = headerArr[i][1].replace(/\s*'/gm, "").trim();
    }

    if (headerArr[i][0].indexOf("DATE") > -1) {
      var timestamp = new Date(headerArr[i][1] + "Z");
      headerArr[i][1] = timestamp.getTime();
    }
  }
  var headerobjtemp = {};

  //Below, we need to convert our two dimensional array into an object MongoDB can understand
  for (var i = 0, iLen = headerArr.length; i < iLen; i++) {
    if (headerArr[i][0] && headerArr[i][1]) {
      headerobjtemp[headerArr[i][0]] = headerArr[i][1];
    }
  }
  headerobj = headerobjtemp;
  if (headerobj["filename"] != "") {
    addFile(filename, headerobj);
  }
  return headerobj;
}

function getFiles(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) done(null, results);
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
}

function getEntries() {
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("gortarchive")
        .find(
          {},
          { projection: { _id: 0, filename: 1, OBJECT: 1, USER: 1, FILTER: 1, DATEOBS: 1 } }
        )
        .toArray(function(err, result) {
          let tempresult = [];
          for (var i = 0; i < result.length; i++) {
            tempresult.push(result[i]["filename"]);
          }
          if (err) throw err;
          db.close();
          syncEntries(tempresult);
          makeStats(result);
        });
        dbo.collection("gortarchive").createIndex( {DATEOBS: -1}, function(err, result){
       //   console.log(result);
        })
    }
  );
}

function syncEntries(entries) {
  getFiles("./img/", function(err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      results[i] = results[i].replace(/^(.*?)\img/, "img");
    }
    let files = results;
    var toAdd = [];
    var toDelete = [];
    for (var i = 0; i < files.length; i++) {
      if (!entries.includes(files[i])) {
        if (files[i].split(".").pop() == "fts") {
          //only .fts files can be indexed. Note that this breaks if names include '.' anywhere else.
          toAdd.push(files[i]);
        }
      }
    }
    for (var i = 0; i < entries.length; i++) {
      if (!files.includes(entries[i])) {
        toDelete.push(entries[i]);
      }
    }
    for (var i = 0; i < toAdd.length; i++) {
      callAdd(toAdd[i]);
    }
    for (var i = 0; i < toDelete.length; i++) {
      deleteEntry(toDelete[i]);
    }
  });
}

//The makeStats function creates select statistics used both for reporting and for
//setting up dropdown filters on the frontend. 
//Note that this is called from getEntries(), so any stat items have to be
//in the projection there.

function makeStats(entries) {
  var objects = [];
  var objects_clean = [];
  var objectsWithFilter = {};
  var usersActivity = {};
  var totalActivity = {};
  var activityOverTime = {};

  //List of objects
  for (var i = 0; i < entries.length; i++) {
    objects.push(entries[i]["OBJECT"]);
  }
  for (var i = 0; i < objects.length; i++) {
    if (objects[i] && objects_clean.indexOf(objects[i]) < 0) {
      objects_clean.push(objects[i]);
    }
  }

  //List of users
  var users = [];
  var users_clean = [];
  for (var i = 0; i < entries.length; i++) {
    users.push(entries[i]["USER"]);
  }
  for (var i = 0; i < users.length; i++) {
    if (users[i] && users_clean.indexOf(users[i]) < 0) {
      users_clean.push(users[i]);
    }
  }

  //List of filters
  var filters = [];
  var filters_clean = [];
  for (var i = 0; i < entries.length; i++) {
    filters.push(entries[i]["FILTER"]);
  }
  for (var i = 0; i < filters.length; i++) {
    if (filters[i] && filters_clean.indexOf(filters[i]) < 0) {
      filters_clean.push(filters[i]);
    }
  }

  //Add list items

  statsObj = {
    name: "lists",
    objects: objects_clean,
    users: users_clean,
    filters: filters_clean
  };

  statsUsers = {
    name: "users",
    users: users_clean
  };

  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("stats")
        .replaceOne({ name: "lists" }, statsObj, { upsert: true });
    }
  );

    //reporting stats
    var maxDate = 0;
    var minDate = 0;

    var totalFiles = entries.length;
    var objectImages = 0;    
    for (var i = 0; i < entries.length; i++) {


      if(entries[i] && entries[i]["OBJECT"] && entries[i]["FILTER"]){
        objectImages += 1;

        //Object total, filter totals
        var objectName = entries[i]["OBJECT"];
        var filter = entries[i]["FILTER"];
        
        if(!objectsWithFilter[objectName]){
          objectsWithFilter[objectName] = {};
        }
        
        if(objectsWithFilter[objectName][filter]){
          objectsWithFilter[objectName][filter] += 1; 
        } else {objectsWithFilter[objectName][filter] = 1;}

        if(objectsWithFilter[objectName]["total"]){
          objectsWithFilter[objectName]["total"] += 1; 
        } else {objectsWithFilter[objectName]["total"] = 1;}
      }
      //Accounting for calibration images, which don't have filters

      if(entries[i] && entries[i]["OBJECT"] && !entries[i]["FILTER"]){
        var objectName = entries[i]["OBJECT"];
        if(!objectsWithFilter[objectName]){
          objectsWithFilter[objectName] = {};
        }
        if(objectsWithFilter[objectName]["total"]){
          objectsWithFilter[objectName]["total"] += 1; 
        } else {objectsWithFilter[objectName]["total"] = 1;}
      }

      //User stats. I know it's tempting to combine all of this into one block,
      //but don't. Some valid entries don't have users, or are otherwise incomplete.
      //Being overly verbose here will let us capture all cases.

      if(entries[i] && entries[i]["USER"]){
        if(usersActivity[entries[i]["USER"]]){
          usersActivity[entries[i]["USER"]] += 1;
        } else {usersActivity[entries[i]["USER"]] = 1; }
      }
 
      //Total activity by date

      if(entries[i] && entries[i]["DATEOBS"]){
        if(entries[i]["DATEOBS"] < minDate || minDate == 0){
          minDate = entries[i]["DATEOBS"];
        }
        if(entries[i]["DATEOBS"] > maxDate){
          maxDate = entries[i]["DATEOBS"]
        }

        var date = new Date(entries[i]["DATEOBS"]);
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var dateindex = month + "-" + year;
        if (totalActivity[dateindex]) {
          totalActivity[dateindex]++;
        } else {
          totalActivity[dateindex] = 1;
        }

        
    }}
 
      var fullStats = {
        name: "reporting",
        objects: objectsWithFilter,
        users: usersActivity,
        totalActivity: totalActivity,
        activityOverTime: activityOverTime,
        totals: {
          files: totalFiles,
          objectImages: objectImages
        },
        maxDate: maxDate,
        minDate: minDate
      };
     
      mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function(err, db) {
          if (err) throw err;
          var dbo = db.db("gortarchive");
          dbo
            .collection("stats")
            .replaceOne({ name: "reporting" }, fullStats, { upsert: true });
        }
      );
    
}

//Restructure this to use callbacks, so that the object list is fed into a function
//that then gets the data, and the API call adds to the object when it's finished
//run object API call as a function in the iteration, where object is an argument, just like it started

//First in the chain: get a list of all objects in the archive. In the
//function after the data is pulled, run objectApiCall on each one. This 
//will update the database with the first round of information, object type.

function getObjectData(){

 // console.log("Running getObjectData");

  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("stats")
        .find(
          {name: "lists"},
          { projection: { _id: 0, objects: 1} }
        )
        .toArray(function(err, result) {
            if(result && result[0] && result[0]['objects']){
              var objectList = result[0]['objects']; } else {
              var objectList = [];
              }
            for(object of objectList){
              objectApiCall(object)
            }
          if (err) throw err;
          db.close();

        });
    }
  );

}

//Make API call to get information on object types. We also build the first part of the 
//database insert object here. This is a series of nested API calls. Sorry. Really I am.
//If you want to get more detailed information for later, put another call using the same query system 
//into the next nested area. Again. Sorry.

function objectApiCall(object){
  var databaseObject = {};
  databaseObject["name"] = object;
  var url = "https://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=";
  var query = encodeURI(`SELECT otype FROM basic JOIN ident ON oid = oidref WHERE id = '` + object + `';`);
  https.get(url + query, (resp) => {
    let data = '';
  
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Add 'otype' to the database object and start the
    // next step, where we find out what it means.

    resp.on('end', () => {
      if(JSON.parse(data) && JSON.parse(data).data && JSON.parse(data).data[0] && JSON.parse(data).data[0][0]){
        var type = JSON.parse(data).data[0][0];
        databaseObject["otype"] = type;
        //call the next query, which tells us what the number means
        var url = "https://simbad.u-strasbg.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=";
        var query = encodeURI(`SELECT otype_longname, otype_shortname FROM otypedef WHERE otype = 0` + type + `;`);
        https.get(url + query, (resp) => {
          let data = '';
        
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
        
          //The whole response has been received. Add 'otype_txt' to the object and print for debug.
          //Since this is our end point, we're going to call the write method. Move this if you nest
          //an additional call later.

          //Since GTN is focused on analyzing variable and eclipsing binary systems, this has a boolean
          //component for those two classes.

          resp.on('end', () => {
            if(JSON.parse(data) && JSON.parse(data).data && JSON.parse(data).data[0] && JSON.parse(data).data[0][0]){
              databaseObject["otype_txt"] = JSON.parse(data).data[0][0];
              //console.log(databaseObject);

              //Check if it meets are quick search criteria, setting a boolean. 

              JSON.parse(data).data[0][0].includes("clipsing binary") ? databaseObject["binary"] = true : databaseObject["binary"] = false
              JSON.parse(data).data[0][0].includes("ariable") ? databaseObject["variable"] = true : databaseObject["variable"] = false
              JSON.parse(data).data[0][0].includes("epheid") ? databaseObject["cepheid"] = true : databaseObject["cepheid"] = false
              JSON.parse(data).data[0][0].includes("alaxy") ? databaseObject["galaxy"] = true : databaseObject["galaxy"] = false
              
              //***********************************/
              writeObjectData(databaseObject);
              //***********************************/

            }
          });
        
          //this error is for the second api call
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });

        
        } else {// console.log("response error on " + object);
      }
      });
   //this error is for the first api call 
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function writeObjectData(objectData){
  mongo.connect(
    mongourl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, db) {
      if (err) throw err;
      var dbo = db.db("gortarchive");
      dbo
        .collection("objectData")
        .replaceOne({ name: objectData["name"] }, objectData, { upsert: true });
    }
  );
}



getEntries(); //Sync database on app restart. Pretty convenient to have here.
getObjectData();

app.listen(3001);
