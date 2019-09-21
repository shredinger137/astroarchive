var fs = require("fs");
let header = "header";

async function readHeader(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    parseHeader(data);
  }

  readHeader(fs.createReadStream('./img/test1.fts', {start: 0, end: 23040})).then(data => {
    header = data; console.log("running then");
    })
    .catch(err => console.error(err))

    console.log(header);

function parseHeader(rawHeaderText){
    //console.log(rawHeaderText);
    var endTag = rawHeaderText.indexOf("END") + 3;
    rawHeaderText = rawHeaderText.substr(0, endTag);
   rawHeaderText = rawHeaderText.split("/");
    for(var i=0; i < rawHeaderText.length; i++){
        rawHeaderText[i] = rawHeaderText[i].replace(/\s\s+/g, ' ');
        rawHeaderText[i] = rawHeaderText[i].split("=");
    }
    console.log(rawHeaderText);
}
  
 

function streamTest(){
    let stream = fs.createReadStream('./img/test1.fts', {start: 0, end: 23040});
streamToString(stream, (data) => {
 // console.log(data);  // data is now my string variable
});
console.log(data);
}


function getHeader(filename){
    var stream;
    stream = fs.createReadStream(filename, { start: 0, end: 23040});
    stream.on("data", function(data) {
        var chunk = data.toString();
        var endTag = chunk.indexOf("END") + 3;
        chunk = chunk.substr(0, endTag);
        var chunk = chunk.split(" /");
        for(var i=0; i < chunk.length; i++){
            chunk[i] = chunk[i].replace(/\s\s+/g, ' ');
            string.push(chunk[i]);
            chunk[i] = chunk[i].split("=");
        }
        
    });
console.log(typeof(string));
}

function streamToString(stream, cb) {
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk.toString());
    });
    stream.on('end', () => {
      cb(chunks.join(''));
    });
  }



//streamTest();



