"use strict";

// Server(Environment) variables
global.isLIVE   = false;
global.isLOCAL  = false;

// Standard libs
var express     = require('express');         // The Nodejs framework
var mongoose    = require('mongoose');        // The mongodb framework
var path        = require('path');            // Set absolute path to files 
var bodyParser  = require('body-parser');     // Parse data from POST requests
var favicon     = require('serve-favicon');   // Serve a favicon to all who request it
var cron        = require('node-cron');       // Run timed Cron jobs
var request     = require('request');         // Request data from API's.
const cors 		= require('cors');
let newDate = new Date()
let tmpDate = newDate.toString().substring(0, 21);


mongoose.Promise = Promise;

var app = express();
app.use(express.static(path.join(__dirname, '')));

console.log("ENVIRONMENT--", process.env.SERVER_NAME);



if (process.env.SERVER_NAME === 'LIVE') {
    
    console.log("########################################");
    console.log("##                                    ##");
    console.log("##       SERVER RUNNING ON LIVE       ##");
    console.log("##                                    ##");
    console.log("##        " + tmpDate  + "            ##");
    console.log("##                                    ##");
    console.log("########################################");
    global.db         = process.env.mongodbUri  // For ECS deployment from github desktop


 } else {

    console.log("########################################");
    console.log("##                                    ##");
    console.log("##      SERVER RUNNING ON LOCAL       ##");
    console.log("##                                    ##");
    console.log("##        " + tmpDate + "        ##");
    console.log("##                                    ##");
    console.log("########################################");
    global.db         = "mongodb://localhost:27017/InvestorSystem";  
    global.state      = "TEST";
    global.server    = "http://localhost:3007";  
    global.isLOCAL    = true;
    global.serverName = 'LOCAL';

  }



// Connect to mongodb
mongoose.connect(global.db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

// Can we connect to mongodb
mongoose.connection.on('connected', () => {
	console.log("**** MongoDB is connected123 " + global.db);
});

// No we cannot, show error
mongoose.connection.on('error', (err) => {
//	criticalLog("MongoDB cannot connect: ", JSON.stringify(err), JSON.stringify(err.stack) , "", 0, req.headers);
	console.log("*** MongoDB cannot connect :" + err);
	throw new Error("*** MongoDB cannot connected " + global.db);
});

// We do NOT want to use findAndModify because its depreciated.
mongoose.set('useFindAndModify', false);

// Set debug = on so we can see what its doing
if (process.env.USERNAME === 'ADMIN') {
	mongoose.set('debug', false); // true
} else {
	mongoose.set('debug', false);
}

// uncomment after placing your favicon in /public. 
// app.use(favicon(path.join(__dirname, 'public', 'fav.png')));

// Setup bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Allow parsing data with external services
app.use(function (req, res, next) {
	//res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, **Authorization**, cache-control');
	res.header('Access-Control-Allow-Credentials', true);
 
	res.header("Access-Control-Allow-Origin", "*"); 
	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,  authorization");
	return next();
});



// Default Set
app.get('/', (req, res) => res.send('Pattaya live server running, mongodb set'))

// Helper port
app.set('port', process.env.PORT || 3007);

// Setup server to listen
var server = app.listen(app.get('port'), function () {
    console.log("Server running at " + server.address().port);
})

// Catch all normal errors
app.use(function (err, req, res, next) {
	
	console.log(err);
	console.trace();
	res.json({ "err": true, "error": err.message });
});

//
// Show instead of console.log cause its much easier to debug!
// 
global.show = (myVariable) => {
  if (global.isLIVE) {return;};
  if (!myVariable && typeof(myVariable) != "object") {
      console.log(myVariable)
      return;
  }
  var front = "";
  var back  = "";
  for (var key in myVariable) {
      if (myVariable.hasOwnProperty(key)) {
          front = key + ": ";
          back = myVariable[key];
          break;
      }
  } 
if (back > 1400000000 && back < 1700000000) {
      var theDate = new Date(back*1000)
      var myDateString = ('0' + theDate.getDate()).slice(-2) + '-'
                  + ('0' + (theDate.getMonth()+1)).slice(-2) + '-'
                  + theDate.getFullYear() + " " + ('0' + theDate.getHours()).slice(-2) + ":" + ('0' + theDate.getMinutes()).slice(-2);
      console.log(front + myDateString + " (unix)"); 
  return;
  }
if (typeof back.getMonth === 'function') {
      var myDateString = ('0' + back.getDate()).slice(-2) + '-'
                  + ('0' + (back.getMonth()+1)).slice(-2) + '-'
                  + back.getFullYear() + " " + ('0' + back.getHours()).slice(-2) + ":" + ('0' + back.getMinutes()).slice(-2);
  return;
}
if (back instanceof Object) {
  console.log(front + JSON.stringify(back, null, 4) + " (obj)");
  return;
  }
  if (typeof(back) == "string") {
    console.log(myVariable + " (str)");
  return;
  }
  if (typeof(back) == "number") {
    console.log(front + back + " (num)");
  return;
  }
  if (typeof(back) == "boolean") {
    console.log(front + back + " (bool)");
  return;
  }
console.log(front + back);
} 