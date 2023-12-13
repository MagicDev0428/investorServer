//
// Log controller
//
let mongoose	  = require('mongoose');
let logController = require("./logController");
let logModel      = require('../models/logModel');
let logTable      = mongoose.model('logModel');


//
// List all the logs using search params
//
exports.logList = (req) => {

	global.show("###### logList ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - several fields that the user can use to search

	return new Promise( async(resolve, reject) => {

		// Do aggregate with search conditions
		logTable = null;
		
		return resolve( { err:false,  logs: logTable } );
	})
}


//
// Get all data used on the log form
//
exports.logGet  = (req) => {

	global.show("###### logGet ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the logs unique key of logs collection)

	return new Promise( async(resolve, reject) => {

		// Check for received data
		if (!received) {
			return reject("Nothing received from caller")
		}

		// log ID missing (_id)
		if (!received._id) {
			return reject("log._id missing")
		}
	
		logTable = null;
		logTable = await logModel.findOne( { "_id" : received._id } );
		if (!logTable) {
			return reject( "log " + received._id + "Not Found!" )
		}

		return resolve( { err:false,  logs: logTable } );
	})
}



//
// Create NEW log with the data from the form
//
exports.logCreate  = (req) => {

	global.show("###### logCreate ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the logs collection)
	//
	// - recieved._id is required but YOU have to fill it our with a Unixx date from Now() or Today()  
	// - recieved.by is required and you will get this from a global variable (this is the Admins nickName)
	// 
	// with the rest of the fields, just fill them out as in log collection (see the logModel.js)
	
	return new Promise( async(resolve, reject) => {

		// Create the log in "log" collection
		
		return resolve( { err:false,  logs: logTable } );
	})
}



//
// Update EXISTING log with the data from the form
//
exports.logSave = (req) => {

	global.show("###### logSave ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the logs collection)
	//
	// - recieved._id is required
	// 
	// with the rest of the fields, just fill them out as in log collection (see the logModel.js)
	return new Promise( async(resolve, reject) => {

		// Update the log in "log" collection
		
		return resolve( { err:false,  logs: logTable } );
	})
}



//
// Delete EXISTING log with the data from the form
//
exports.logDelete  = (req) => {

	global.show("###### logDelete  ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the logs unique key of logs collection)

	return new Promise( async(resolve, reject) => {

		// Check that log allready exist based _id

		// IF he exist then DELETE the log
		
		return resolve( { err:false,  logs: logTable } );
	})
}

