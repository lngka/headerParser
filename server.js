'use strict';

var fs = require('fs');
var express = require('express');
var app = express();

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.get('/', function (req, res) {
  var headers = req.headers;
  
  // x-forwarded-for is a comma separated string, first element being IPv4
  var ip = headers['x-forwarded-for'].match(/[^,]*/g)[0];
  // accept-language is a comma separated string, first element being the main accepted language
  var language = headers['accept-language'].match(/[^,]*/g)[0];
  // first occurence of string between parentheses is the os
  var os = headers['user-agent'].match(/\(([^)(]+)\)/)[0];
  
  var result = {
    'ip': ip,
    'language': language,
    'os': os.slice(1, -1)//remove parentheses
  };
  res.json(result);
})

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});


app.listen(process.env.PORT, function (err) {
  if (err) throw err;
  console.log('Node.js listening ...');
});

