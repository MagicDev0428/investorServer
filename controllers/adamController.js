//
// adam controller
//
let mongoose	  = require('mongoose');
let adamController = require("./adamController");
let adamModel      = require('../models/adamModel');
let adamTable      = mongoose.model('adamModel');


//
// List all from adam collection
//
exports.adamList = (req) => {

	global.show("###### adamList ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - NONE, just list all records ordered by _id 

	return new Promise( async(resolve, reject) => {

		// Do aggregate
		adamTable = null;
		
		return resolve( { err:false,  adams: adamTable } );
	})
}


//
// Get all data used on the adam form
//
exports.adamGet  = (req) => {

	global.show("###### adamGet ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the adams unique key of adams collection)

	return new Promise( async(resolve, reject) => {

		// Check for received data
		if (!received) {
			return reject("Nothing received from caller")
		}

		// adam ID missing (_id)
		if (!received._id) {
			return reject("adam._id missing")
		}
	
		adamTable = null;
		adamTable = await adamModel.findOne( { "_id" : received._id } );
		if (!adamTable) {
			return reject( "adam " + received._id + "Not Found!" )
		}

		return resolve( { err:false,  adams: adamTable } );
	})
}



//
// Create NEW adam with the data from the form
//
exports.adamCreate  = (req) => {

	global.show("###### adamCreate ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the adams collection)
	//
	// - recieved._id is required but YOU have to fill it our with a Unixx date from Now() or Today()  
	// - recieved.by is required and you will get this from a global variable (this is the Admins nickName)
	// 
	// with the rest of the fields, just fill them out as in adam collection (see the adamModel.js)
	
	return new Promise( async(resolve, reject) => {

		// Create the adam in "adam" collection
		
		// Sati/Ahsan must make function to upload the files		

		global.saveLog(global.adminNick, "ADAM", adamTable.investorName, adamTable.investmentNo, "Created transaction: " + formatDateTime(adamTable._id) + " " + adamTable.desctiption);

		return resolve( { err:false,  adams: adamTable } );
	})
}



//
// Update EXISTING adam with the data from the form
//
exports.adamSave = (req) => {

	global.show("###### adamSave ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the adams collection)
	//
	// - recieved._id is required
	// 
	// with the rest of the fields, just fill them out as in adam collection (see the adamModel.js)
	return new Promise( async(resolve, reject) => {

		// Update the adam in "adam" collection

		// Sati/Ahsan must make function to upload the files		

		global.saveLog(global.adminNick, "ADAM", adamTable.investorName, adamTable.investmentNo, "Updated transaction: " + formatDateTime(adamTable._id) + " " + adamTable.desctiption);
		
		return resolve( { err:false,  adams: adamTable } );
	})
}



//
// Delete EXISTING adam with the data from the form
//
exports.adamDelete  = (req) => {

	global.show("###### adamDelete  ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the adams unique key of adams collection)

	return new Promise( async(resolve, reject) => {

		// Check that adam allready exist based _id

		// IF he exist then DELETE the adam

		// Sati/Ahsan must make function to delete the files		

		global.saveLog(global.adminNick, adamTable.investorName, adamTable.investmentNo, "Deleted transaction: " + formatDateTime(adamTable._id) + " " + adamTable.desctiption);

		return resolve( { err:false,  adams: adamTable } );
	})
}

