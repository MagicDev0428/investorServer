//
// Investor controller
//
let mongoose	       = require('mongoose');
let investorController = require("./investorController");
let investorModel      = require('../models/investorModel');
let investorTable      = mongoose.model('investorModel');


//
// List all the investors with their balance and investment amounts
//
exports.investorList = (req) => {

	global.show("###### investorList ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - none is needed to get the full list of investors

	return new Promise( async(resolve, reject) => {

		// DO your aggregate
		investorTable = null;

		// You need to calculate the total amount invested by summing up all records in myInvestments
		// Where myInvestments.investorName = investors._id and get the sum of myInvestments.amountInvested

		// You need to calculate the total amount of deposit/withdrawal by summing up all records in balance
		// Where balance.investorName = investors._id and get the sum of balance.deposit andbalance.withdraw 

	
		// You also need to look if the investor have been paid his profit THIS month and got an EMAIL
	
		// IF we are in Nov-2023 and there is a balance.profitMonth = Nov-2023 and 
		//    there is a balance.deposit > 0 and the balance.email date is > 0
		// THEN put "button" : "GREEN" into that investor record  
		// (this means we paid profit this month AND we send investor an email)

		// IF we are in Nov-2023 and there is a balance.profitMonth = Nov-2023 and 
		//    there is a balance.deposit > 0 and the balance.email date is == 0 or Null
		// THEN put "button" : "YELLOW" into that investor record  
		// (this means we paid profit this month BUT forget to send investor an email)
	
		// IF we are in Nov-2023 and there is NO balance.profitMonth = Nov-2023 OR 
		//    there is NO balance.deposit > 0 for that profitMonth 
		// THEN put "button" : "RED" into that investor record  
		// (this means we did NOT pay profit this month)
	
		// And now it gets really tricky!!
		// IF we are in Nov-2023 and there is a balance.profitMonth = Nov-2023 and 
		//    there is a balance.deposit > 0 BUT!! the balance.deposit is < the profit we HAVE to pay 
		// THEN put "button" : "RED" into that investor record  
		// (this means we paid profit this month BUT its LESS than we should have paid)
		// How to find out how much profit we SHOULD have paid? 
		// Find all records in myInvestments and sum up ( myInvestments.amountInvested * myInvestments.profitMonthly in PCT!!!)
		// Where myInvestments.investorName = investors._id
		// Unless its a month or year investment..  gaaah now it gets REAL complex - perhaps we write that part together :)


		return resolve( { err:false,  investors: investorTable } );
	})
}


//
// Get all data used on the investor form
//
exports.investorGet  = (req) => {

	global.show("###### investorGet ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investors name and unique key of investors collection)

	return new Promise( async(resolve, reject) => {

		// Check for received data
		if (!received) {
			return reject("Nothing received from caller")
		}

		// Investor name missing (_id)
		if (!received._id) {
			return reject("Investor name missing")
		}
	
		investorTable = null;
		investorTable = await investorModel.findOne( { "_id" : received._id } );
		if (!investorTable) {
			return reject( "Investor " + received._id + "Not Found!" )
		}

		return resolve( { err:false,  investors: investorTable } );
	})
}



//
// Create NEW investor with the data from the form
//
exports.investorCreate  = (req) => {

	global.show("###### investorCreate ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the investors collection)
	//
	// - recieved._id is required
	// - recieved.nickName is required
	//
	// - recieved.admin is special - you must ALWAYS set this to FALSE in the creation. (boolean)
	//
	// - recieved.googleAuth there will be some way for you to get this, I got a guy working on it
	//
	// - recieved.Pincode must be generated by you - do a number from 10 to 99 and put it twice - like 5757 or 2424 
	// 
	// - recieved.email or beneficiaryEmail - if they have been filled out, validate that the email is an actually email (use some standard validation function from somewhere)
	// 
	// with the rest of the fields, just fill them out as in investor collection (see the investorModel.js)
	
	return new Promise( async(resolve, reject) => {

		// Do all your stuff

		// Check that investor does not allready exist, if he do then return error
		// Investor name is required "_id"
		// Investor nickName is required
		// If the email is there, then validate that its a correct email
		// later you have to call a function that creates the investors folder on google drive, that functions is made by other guy

		// Create the investor in "investor" collection

		// Sati/Ahsan must make function to CREATE the investors folders and upload the files		

		global.saveLog(global.adminNick, "INVESTOR", investorTable._id, "000", "Created a new Investor: " + investorTable._id + " (" + investorTable.nickName + ")");

		return resolve( { err:false,  investors: investorTable } );
	})
}



//
// Update EXISTING investor with the data from the form
//
exports.investorSave = (req) => {

	global.show("###### investorSave ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved.*   (you get ALL fields in the investors collection)
	//
	// - recieved._oldId is required (this is the _id BEFORE the user started editing the record)
	// - recieved._id is required
	// - recieved.nickName is required
	//
	// - recieved.admin is special - never touch this, not even if it is set to true or false from the client
	//
	// - recieved.googleAuth there will be some way for you to get this, I got a guy working on it
	//
	// - recieved.Pincode must be generated by you if it does not already exist - do a number from 10 to 99 and put it twice - like 5757 or 2424 
	// 
	// - recieved.email or beneficiaryEmail - if they have been filled out, validate that the email is an actually email (use some standard validation function from somewhere)
	// 
	// with the rest of the fields, just fill them out as in investor collection (see the investorModel.js)
	return new Promise( async(resolve, reject) => {


		// Investor changing his name (change of the _id)
		//
		// IF he already exist and the _id != _oldId (investorname has changed) 
		// then it gets a bit tricky cause this was the unique ID
		// 1) Check if the new "_id" already exist, if it does then reject with error "investor name " + _id + " already exist"	
		// 2) If the new "_id" does not exist then read the data from _oldId  
		// 3) DELETE the investor with _oldId 
		// 4) Create him with the NEW _id and the data 
        // 5) Update ALL records in "balance" collection where investorName = _oldId and change to _id
        // 6) Update ALL records in "myInvestments" collection where investorName = _oldId and change to _id
        // 7) Update ALL records in "log" collection where investorName = _oldId and change to _id
		// 
		// The investor has now changed his name everywhere
		global.saveLog(global.adminNick, "INVESTOR", investorTable._id, "000", "Changed the Investor name from: " + recieved._idOld + " to: " + investorTable._id + " (" + investorTable.nickName + ")");

		// Sati/Ahsan must make function to MOVE the investors folders and files		


		// IF he already exist and the _id (investorname has NOT changed) then UPDATE the investor the NEW data.

		// Sati/Ahsan must make function to upload and or delete any new files		

		global.saveLog(global.adminNick, "INVESTOR", investorTable._id, "000", "Updated the Investor: " + investorTable._id + " (" + investorTable.nickName + ")");

		return resolve( { err:false,  investors: investorTable } );
	})
}



//
// Delete EXISTING investor with the data from the form
//
exports.investorDelete  = (req) => {

	global.show("###### investorDelete  ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investors name and unique key of investors collection)

	return new Promise( async(resolve, reject) => {

		// Check that investor allready exist based on _id

		// 1) IF he exist then DELETE the investor
        // 2) Delete ALL records in "balance" collection where investorName = _oldId and change to _id
        // 3) Delete ALL records in "myInvestments" collection where investorName = _oldId and change to _id
        // 4) Do NOT delete records in "log" collection - we want to keep this for reference of what happened

		global.saveLog(global.adminNick, "INVESTOR", investorTable._id, "000", "Deleted the Investor: " + investorTable._id + " (" + investorTable.nickName + ")");

		return resolve( { err:false,  investors: investorTable } );
	})
}


//
// Get INFO from EXISTING investor 
//
exports.investorInfo   = (req) => {

	global.show("###### investorInfo  ######")
	let received = req ? req.body : null;
	if (received) global.show({received});

	// Input from recieved:
	// - recieved._id (the investors name and unique key of investors collection)

	return new Promise( async(resolve, reject) => {

		// Check that investor exist with _id

		// Do aggregate to get ALL the data needed for the investor INFO page
		
		return resolve( { err:false,  investors: investorTable } );
	})
}
