//
// investment controller
//
let mongoose		     = require('mongoose');
let investmentController = require("./investmentController");
let investmentModel      = require('../models/investmentModel');
let investmentTable      = mongoose.model('investmentModel');


//
// List all from investment collection
//
exports.investmentList = (req) => {

	global.show("###### investmentList ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - NONE, just list all records ordered by _id 

	return new Promise( async(resolve, reject) => {

		// Do aggregate
		investmentTable = null;
		
		return resolve( { err:false,  investments: investmentTable } );
	})
}


//
// Get all data used on the investment form
//
exports.investmentGet  = (req) => {

	global.show("###### investmentGet ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investments unique key of investments collection)

	return new Promise( async(resolve, reject) => {

		// Check for received data
		if (!received) {
			return reject("Nothing received from caller")
		}

		// investment ID missing (_id)
		if (!received._id) {
			return reject("investment._id missing")
		}
	
		investmentTable = null;
		investmentTable = await investmentModel.findOne( { "_id" : received._id } );
		if (!investmentTable) {
			return reject( "investment " + received._id + "Not Found!" )
		}

		return resolve( { err:false,  investments: investmentTable } );
	})
}


//
// Get all data used on the investment form
//
exports.investmentInfo  = (req) => {

	global.show("###### investmentInfo ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investments unique key of investments collection)

	return new Promise( async(resolve, reject) => {

		// Check for received data
		if (!received) {
			return reject("Nothing received from caller")
		}

		// investment ID missing (_id)
		if (!received._id) {
			return reject("investment._id missing")
		}
	
		investmentTable = null;

		// This one is a bit tricky, I would probably do it with one big aggregate or with several seperate find()
		// You need to find the investment in the investment collection of cause

		// Then you need to find all records in myInvestment where myInvestment.investmentNo = received._id
		// And sum of myInvestment.amountInvested for all records found and send that to client also 
		// And investment.investAmount MINUS sum of myInvestment.amountInvested and send that to client also 

		// Then you need to find all records in adam where adam.investmentNo = received._id
		// And sum of adam.amount for all records found and send that to client also 

        // Then you need to find all records in log where log.investmentNo = received._id
		// And finally send all this data to the client 

		// Also, you need to send amount of days till investment expires to the client. 
		// investment.endDate - investment.startDate (and convert that to number of days)

		// investmentTable = await investmentModel.findOne( { "_id" : received._id } );
		// if (!investmentTable) {
		//	return reject( "investment " + received._id + "Not Found!" )
		// }

		return resolve( { err:false,  investments: investmentTable, myInvestments: myInvestmentTable, adam: adamTable, log: logTable } );
	})
}



//
// Create NEW investment with the data from the form
//
exports.investmentCreate  = (req) => {

	global.show("###### investmentCreate ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the investments collection)
	//
	// - recieved._id is required and can NOT be changed - EVER!
	// - recieved.by is required and you will get this from a global variable (this is the Admins nickName)
	// 
	// with the rest of the fields, just fill them out as in investment collection (see the investmentModel.js)
	
	return new Promise( async(resolve, reject) => {

		// Create the investment in "investment" collection
		
		// Sati/Ahsan must make function to upload the files		

		global.saveLog(global.adminNick, "investment", investmentTable.investorName, investmentTable.investmentNo, "Created investment: " + investmentTable._id + " " + investmentTable.desctiption);

		return resolve( { err:false,  investments: investmentTable } );
	})
}



//
// Update EXISTING investment with the data from the form
//
exports.investmentSave = (req) => {

	global.show("###### investmentSave ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the investments collection)
	//
	// - recieved._id is required and can NOT be changed - EVER!
	// 
	// with the rest of the fields, just fill them out as in investment collection (see the investmentModel.js)
	return new Promise( async(resolve, reject) => {

		// Update the investment in "investment" collection

		// Sati/Ahsan must make function to upload the files		

		global.saveLog(global.adminNick, "investment", investmentTable.investorName, investmentTable.investmentNo, "Updated investment: " + investmentTable._id + " " + investmentTable.desctiption);
		
		return resolve( { err:false,  investments: investmentTable } );
	})
}



//
// Delete EXISTING investment with the data from the form
//
exports.investmentDelete  = (req) => {

	global.show("###### investmentDelete  ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investments unique key of investments collection)

	return new Promise( async(resolve, reject) => {

		// Check that investment allready exist based _id

		// Check if there are any records in myInvestments with investmentNo matching the _id - if there are return error "Investment already have investors"
		// Check if there are any records in adam with investmentNo matching the _id - if there are return error "Investment already have adam transactions"

		// Sati/Ahsan must make function to delete any files		

		global.saveLog(global.adminNick, investmentTable.investorName, investmentTable.investmentNo, "Deleted nvestment: " + _id + " " + investmentTable.desctiption);

		return resolve( { err:false,  investments: investmentTable } );
	})
}

