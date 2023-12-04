"use strict";
import express from 'express'; // The Nodejs framework
import mongoose from 'mongoose';        // The mongodb framework
import path from 'path';            // Set absolute path to files 
import bodyParser from 'body-parser';     // Parse data from POST requests
import responseHelper from 'express-response-helper';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { investorRoutes, documentRoutes } from './routes';
import { errorMiddleware } from './utils/middlewares';
const investorRoute = require("./routes/investor/investorRoute");
require("./logger/simpleLogger"); // global.show is imported from simpleLogger


dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local'
});

let newDate = new Date();
let tmpDate = newDate.toString().substring(0, 21);


// Server(Environment) variables
global.isLIVE = false;
global.isINFO = false;
global.isLOCAL = false;
global.isLIVE   = false;
global.isLOCAL  = false;
mongoose.Promise = Promise;

const app = express();
app.use(express.static(path.join(__dirname, '')));
app.use(cors());
app.use(responseHelper.helper());

console.log("ENVIRONMENT--", process.env.SERVER_NAME);

if (process.env.SERVER_NAME === "LIVE") {
  console.log("########################################");
  console.log("##                                    ##");
  console.log("##       SERVER RUNNING ON LIVE       ##");
  console.log("##                                    ##");
  console.log("##        " + tmpDate + "            ##");
  console.log("##                                    ##");
  console.log("########################################");
  global.db = process.env.mongodbUri; // For ECS deployment from github desktop
} else if (process.env.SERVER_NAME === "INFO") {
  console.log("########################################");
  console.log("##                                    ##");
  console.log("##      SERVER RUNNING ON INFO        ##");
  console.log("##                                    ##");
  console.log("##        " + tmpDate + "             ##");
  console.log("##                                    ##");
  console.log("########################################");
  global.db = "mongodb://localhost:27017/pattayanight"; // For ocean info droplet server
} else {
  console.log("########################################");
  console.log("##                                    ##");
  console.log("##      SERVER RUNNING ON LOCAL       ##");
  console.log("##                                    ##");
  console.log("##        " + tmpDate + "        ##");
  console.log("##                                    ##");
  console.log("########################################");
  global.db = "mongodb://localhost:27017/InvestorSystem";

  global.state = "TEST";
  global.server = "http://localhost:3007";
  global.isLOCAL = true;
  global.serverName = "LOCAL";
}

// Connect to mongodb
mongoose.connect(global.db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

// Can we connect to mongodb
mongoose.connection.on("connected", () => {
  console.log("**** MongoDB is connected123 " + global.db);
});

// No we cannot, show error
mongoose.connection.on('error', (err) => {
//	criticalLog("MongoDB cannot connect: ", JSON.stringify(err), JSON.stringify(err.stack) , "", 0, req.headers);
	console.log("*** MongoDB cannot connect :" + err);
	throw new Error("*** MongoDB cannot connected " + global.db);
});

// We do NOT want to use findAndModify because its depreciated.
mongoose.set("useFindAndModify", false);

// Set debug = on so we can see what its doing
if (process.env.USERNAME === "ADMIN") {
  mongoose.set("debug", false); // true
} else {
  mongoose.set("debug", false);
}

// uncomment after placing your favicon in /public.
// app.use(favicon(path.join(__dirname, 'public', 'fav.png')));

// Setup bodyParser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Allow parsing data with external services
app.use(function (req, res, next) {
  //res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, **Authorization**, cache-control"
  );
  res.header("Access-Control-Allow-Credentials", true);

  res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,  authorization");
  return next();
});

app.use('/investors', investorRoutes.router);
app.use('/documents', documentRoutes.router);

// Default Set
app.get('/', (req, res) => {
  res.respond({
    message: 'Pattaya live server running, mongodb set'
  });
});

// Helper port
app.set("port", process.env.PORT || 3007);

// This route needs authentication
app.get('/private', checkJwt, (req, res) => {
  res.respond({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

// investor route calling in app.js
app.use("/investor", investorRoute);

// Setup server to listen
const server = app.listen(app.get('port'), function () {
  console.log("Server running at " + server.address().port);
});

// // Catch all normal errors
// app.use(function (err, req, res, next) {
	
// 	console.log(err);
// 	console.trace();
// 	res.json({ "err": true, "error": err.message });
// });
app.use(errorMiddleware);

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