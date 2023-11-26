"use strict";



// Server(Environment) variables
global.isLIVE   = false;
global.isINFO   = false;
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
const { auth } = require('express-oauth2-jwt-bearer');
const { User } = require('./models/user');
const { createInvoice, htmlToPdf } = require('./utils/functions');

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local'
});

mongoose.Promise = Promise;

var app = express();
app.use(express.static(path.join(__dirname, '')));
app.use(cors());

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



} else if (process.env.SERVER_NAME === 'INFO') {

  console.log("########################################");
  console.log("##                                    ##");
  console.log("##      SERVER RUNNING ON INFO        ##");
  console.log("##                                    ##");
  console.log("##        " + tmpDate + "             ##");
  console.log("##                                    ##");
  console.log("########################################");
  global.db         = "mongodb://localhost:27017/pattayanight";   // For ocean info droplet server


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

const checkJwt = auth({
  audience: global.server,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});



// Connect to mongodb
mongoose.connect(global.db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

// Can we connect to mongodb
mongoose.connection.on('connected', () => {
	console.log("**** MongoDB is connected123 " + global.db);
});

// No we cannot, show error
mongoose.connection.on('error', (err) => {
	criticalLog("MongoDB cannot connect: ", JSON.stringify(err), JSON.stringify(err.stack) , "", 0, req.headers);
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
app.get('/', (req, res) => {
  res.json({
    message: 'Pattaya live server running, mongodb set'
  });
});

// Helper port
app.set('port', process.env.PORT || 3007);

// This route needs authentication
app.get('/private', checkJwt, (req, res) => {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

app.get('/send-mail', async (req, res) => {
  const html = await createInvoice({ 
    logo_url: 'https://sparksuite.github.io/simple-html-invoice-template/images/logo.png',
    invoice: {
      number: '123',
      date: 'January 1, 2023',
      due_date: 'February 1, 2023'
    },
    company: {
      name: 'Sparksuite, Inc.',
      street: '12345 Sunny Road',
      city: 'Sunnyville, CA',
      zip_code: '12345'
    },
    investor: {
      company_name: 'Acme Corp.',
      name: 'John Doe',
      email: 'john@example.com'
    },
    payment_method: {
      name: 'Check',
      type: 'Check #',
      id: '1000'
    },
    collection: [
      { name: 'Website design', price: '$300.00' },
      { name: 'Hosting (3 months)', price: '$75.00' },
      { name: 'Domain name (1 year)', price: '$10.00' },
      { name: 'Website design', price: '$300.00' },
      { name: 'Website design', price: '$300.00' },
    ],
    total: '$385.00'
  });

  console.log(html);
  if (html) {
    const pdf = await htmlToPdf(html);
    console.log(pdf);
  }


  res.json({
    message: 'done'
  });
});

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

