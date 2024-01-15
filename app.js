"use strict";
import express from "express"; // The Nodejs framework
import mongoose from "mongoose"; // The mongodb framework
import path from "path"; // Set absolute path to files
import bodyParser from "body-parser"; // Parse data from POST requests
import dotenv from "dotenv";
import responseHelper from "express-response-helper";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import jwksClient from "jwks-rsa";
import { expressjwt as jwt } from "express-jwt";
import jsondocs from "./docs/index.json";
import { investorRoutes, documentRoutes,logRoutes,balanceRoute } from "./routes";
import { Middlewares, Docs } from "./utils";
import { router as myInvestmentRouter} from "./routes/myInvestment/myInvestmentRoute"
const investorRoute = require("./routes/investor/investorRoute");
const adamRoute = require("./routes/adam/adamRoute");
const investmentRoute = require("./routes/investment/investmentRoute")
// require("./logger/simpleLogger"); // global.show is imported from simpleLogger
require('./utils/logger/index');
const factory = require("./utils/factories/google"); // Google factory
import { Factories,Lib } from './utils';

const fs = require("fs");

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local",
});

let newDate = new Date();
let tmpDate = newDate.toString().substring(0, 21);

// Server(Environment) variables
global.isLIVE = false;
global.isINFO = false;
global.isLOCAL = false;
global.isLIVE = false;
global.isLOCAL = false;
mongoose.Promise = Promise;

const app = express();
app.use(express.static(path.join(__dirname, "")));
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
  global.db =
    "mongodb+srv://torben:0yemRa61w7FbnqDm@cluster0.zfsf0vx.mongodb.net/InvestorSystem";
  //global.db = "mongodb+srv://insram:insram@cluster0.u1nadii.mongodb.net/InvestorSystem"
  //global.db = "mongodb://localhost:27017/InvestorSystem";
  global.state = "TEST";
  global.server = "http://localhost:3007";
  global.isLOCAL = true;
  global.serverName = "LOCAL";
}

/* this is auth code, this is adding verification for the token */
/* you don't need to change anything here. It is standard and require no updates */
/* audience is the api endpoint for which the access_token has been granted access */
/* issuerBaseURL is the auth0 client which is issuing the token and where all the users reside */
/* secret is the secret value generated by the client, can be accessed from the auth0 client page */
/* alogtithm is the signing mechanism which is used for signing the token */
export const checkJwt = jwt({
  audience: global.server,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.AUTH0_SECRET,
  algorithms: ["RS256"],
  secret: jwksClient.expressJwtSecret({
    cache: true, // cache the public key so we are not making request to auth0 for each request to api endpoint
    reateLimit: true, // auth0 rate limits the api so enforce rate limiting 
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json` // public keys for the auth0 client used for verifying the token
  })
});

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
mongoose.connection.on("error", (err) => {
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

/**
 * Docs
 */
app.use("/docs", swaggerUI.serve, swaggerUI.setup(jsondocs));

// // use auth for all endpoints
app.use(checkJwt);

// setting user name in global variable 
app.use((req, res, next) => {
  global.userName = Lib.getAdminName(req.auth);
  next();
});
/**
 * ROUTES
 */
app.get("/", (req, res) => {
  res.respond({
    message: "Pattaya live server running, mongodb set",
  });
});


//app.use("/investors", investorRoutes.router);
//app.use("/documents", documentRoutes);
app.use("/investor", investorRoute);
app.use("/adam", adamRoute);
app.use("/log", logRoutes.router);
app.use("/investments",investmentRoute);
app.use("/balances",balanceRoute.router);
app.use("/myinvestment",myInvestmentRouter)

// Helper port
app.set("port", process.env.PORT || 3007);

// This route needs authentication
// app.get("/private", checkJwt, (req, res) => {
//   res.json({
//     message:
//       "Hello from a private endpoint! You need to be authenticated to see this.",
//   });
// });



// Setup server to listen
const server = app.listen(app.get("port"), function () {
  console.log("Server running at " + server.address().port);
  console.log(
    `Docs are available at http://localhost:${server.address().port}/docs`
  );
});

// // Catch all normal errors
// app.use(function (err, req, res, next) {

// 	console.log(err);
// 	console.trace();
// 	res.json({ "err": true, "error": err.message });
// });
app.use(Middlewares.errorMiddleware);

//
// Show instead of console.log cause its much easier to debug!
//
global.show = (myVariable) => {
  if (global.isLIVE) {
    return;
  }
  if (!myVariable && typeof myVariable != "object") {
    console.log(myVariable);
    return;
  }
  var front = "";
  var back = "";
  for (var key in myVariable) {
    if (myVariable.hasOwnProperty(key)) {
      front = key + ": ";
      back = myVariable[key];
      break;
    }
  }
  if (back > 1400000000 && back < 1700000000) {
    var theDate = new Date(back * 1000);
    var myDateString =
      ("0" + theDate.getDate()).slice(-2) +
      "-" +
      ("0" + (theDate.getMonth() + 1)).slice(-2) +
      "-" +
      theDate.getFullYear() +
      " " +
      ("0" + theDate.getHours()).slice(-2) +
      ":" +
      ("0" + theDate.getMinutes()).slice(-2);
    console.log(front + myDateString + " (unix)");
    return;
  }
  if (typeof back.getMonth === "function") {
    var myDateString =
      ("0" + back.getDate()).slice(-2) +
      "-" +
      ("0" + (back.getMonth() + 1)).slice(-2) +
      "-" +
      back.getFullYear() +
      " " +
      ("0" + back.getHours()).slice(-2) +
      ":" +
      ("0" + back.getMinutes()).slice(-2);
    return;
  }
  if (back instanceof Object) {
    console.log(front + JSON.stringify(back, null, 4) + " (obj)");
    return;
  }
  if (typeof back == "string") {
    console.log(myVariable + " (str)");
    return;
  }
  if (typeof back == "number") {
    console.log(front + back + " (num)");
    return;
  }
  if (typeof back == "boolean") {
    console.log(front + back + " (bool)");
    return;
  }
  console.log(front + back);
};


/******************************************************************** ************************
* *************** All PRIVATE Routes for TESTING of Utilities Methods for Torben *************
**********************************************************************************************/

//
// List all folders
//
app.get('/listFolders', async (req, res) => {

  // Get the google drive client 
  const client = factory.getGoogleDriveInstance();
  // use google drive client for list of folders
  const folders = await client.listFolders();
  console.log(folders);

  res.respond(folders);
});

//
// Create folder
//
app.post('/createFolder', async (req, res) => {

  // Get the google drive client 
  const client = factory.getGoogleDriveInstance();

  // Use google drive client and create folder
  
  // create only 1 folder at root level
  const folders = await client.createFolders(null, "Satendra6");
  // Create folder at any level @argument1=<Parent Folder ID>, @argument2="Child Folder Name"
  //const folders = await client.createFolders("1qwsDVtMvKBv-c7hLekDUt6EXTiNOMeI7", "Satendra2-child1");
  res.respond(folders);
});


//
// Delete folder
//
app.delete('/deleteFolder', async(req, res) => {

  // Get the google drive client 
  const client = factory.getGoogleDriveInstance();
  // use google drive client for list of folders
  const folders = await client.listFolders();
  // Find the folderId which folder you want to delete
  let folderToDelete = folders.find(folder => folder.name === "Satendra5");
  // Delete the folder Using folderId  
  const response = client.deleteFolder(folderToDelete.id);
  res.respond(response);
});

//
// Delete File
//
app.delete('/deleteFile', async(req, res) => {

  // Get the google drive client 
  const client = factory.getGoogleDriveInstance(); 
  // Delete the file Using fileId  
  const response = client.deleteFile("15l4cs9a3R4ppB6eDmAoozr4JoysA7mIB");
  res.respond(response);
});

//
// Upload file
//
app.post("/uploadFile", async(req, res) => {

  // Get the google drive client 
  const client = factory.getGoogleDriveInstance();
  // Upload the file 
  const response = await client.uploadFile("uploads/1701982589471.PNG", "1EE3cKs2FvwnFw_zzHAfTwJ1qEhmXAm8C");
  res.respond(response);
});

// Get weblink of any file
app.get("/getWebLink", async(req, res) => {
  // Get the google drive client 
  const client = factory.getGoogleDriveInstance();
  // Upload the file 
  const response = await client.getWebLink("1x2ZAX1OLZCLYi06XTqV15RGL5nawiJwK");
  res.respond(response);
});


/************* Documents functions examples ***********************/
app.post("/savePDF", async(req, res) => {

  const name = 'Torben';
  const data = {
    name: 'Torben Rudgaard',
    email: 'torben.test@gmail.com',
    company_name: 'thaihome',
    number: 23456
    // more data as needed by the liquid file of the invoice template
  };
  
  /* the template is in the documents folder */
  //const type = 'documents';

  /* the acutual template folder name where liquid file is placed. */
  const template = 'invoice';
  
  /* the id of the documents folder which belongs the the investor Ahsan Butt */
  const folderId = '1bnbCKqIgVJnxt1t-YEu2rKSIDGAGvZAo';

  const typeOfDocument = 'Balance';
  /* create the template file */
  const document = new Factories.Document(data, template, name, typeOfDocument);
  const path = await document.create();
  
  /* fileId is the id of the file on google drive. You need to save it to the */
  /* investor object in db. */
  const fileId = await document.savePDF(folderId);
  res.respond(fileId);
});


/******************* Email function *****************************/
app.post("/sendEmail", async(req, res) => {

  let received = req.body

  let email = "torben@rudgaard.com;satendra.rawat2011@gmail.com";
  //let email = "satendra.rawat2011@gmail.com";
  const client = new Factories.Email(email);

  /* setSubject is used to set the subject of the email. */
  client.setSubject('BitCoin Investment Monthly Payment Dec 2023');

  /* setText to set the raw text as body of the email */
  //client.setText('This is the body of the email. Right now it is text');


  let html = await Lib.readFile(__dirname + "/templates/emails/balance/balance.html");

  html = html.replace("[NICKNAME]", 'Rawat')
  html = html.replace("[MONTHPROFIT]", '1500 thb');
  html = html.replace("[MONTH-YEAR]", "Dec 2023");
  html = html.replace("[TOTALINVEST]", "10,000 thb");
  html =  html.replace("[TOTALPROFIT]", "150,000 thb");
  html =  html.replaceAll("[INVESTORSPAGE]", "http://localhost:4200/");

  /* setHtml to set the html as body of the email */
  client.setHtml(html);

  /* attach function attaches the pdf files which are at the google drive */
  /* you need to provide the fileId, which should've been saved in the investor model. */
  /* you can attach multiple documents like that. The attachment must be a pdf,  */
  /* otherwise your the client will throw an error. */
  //await client.attach("1GNTkCg3oGXpyyhl5ChoMSNlBMhpeKdpd");
  //await client.attach(fileIdB);

  /* when you have set everything, call send function to send the email. */
  await client.send();

  //   global.saveLogs({
  //     logType:'EMAIL',
  //     investorName:received.investorName,
  //     description:`Sent email to ${received.investorName} that ${received.amount} was paid as Monthly Profit.`,
  // })

  res.respond("mail sent");
});