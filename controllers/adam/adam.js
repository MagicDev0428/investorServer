//
// Adam Controller
//

import { Models } from "../../models";

// creating adam table model
let adamTable = Models.adamModel;

//
// Create NEW adam with the data from the form
//

exports.adamCreate = (req) => {
  global.show("###### adamCreate ######");
  let received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    try{
    // Checking if investor body is empty or not
    if (!received) {
      return reject({
        err: true,
        message: "Adam form is empty!",
      });
    }

    // Unixx date as an id
    // received._id = new Date().getTime();

    // creating new adam instance
    const newAdam = new Models.adamModel(received);

    adamTable = null;
    adamTable = await newAdam.save();

    // global.saveLog(
    //   global.adminNick,
    //   "ADAM",
    //   adamTable.investorName,
    //   adamTable.investmentNo,
    //   "Created transaction: " +
    //     formatDateTime(adamTable._id) +
    //     " " +
    //     adamTable.desctiption
    // );

    if (adamTable) return resolve({ err: false, adams: adamTable });
    return reject({ err: true, message: "Error in adam creation!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

//
// Get all data used on the adam form
//
exports.adamGet = (adamId) => {
  global.show("###### adamGet ######");
  if (adamId) global.show(adamId);

  // Input from recieved:
  // - recieved._id (the adams unique key of adams collection)

  return new Promise(async (resolve, reject) => {
    try {
      
    
    // Check for received data
    if (!adamId) {
      return reject("Id is not recieved.");
    }
    
    adamTable = null;
    adamTable = await Models.adamModel.findOne({ _id: adamId });
    if (!adamTable) {
      return reject({ err: true, message: "adam " + adamId + "Not Found!" });
    }

    return resolve({ err: false, adams: adamTable });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

//
// Delete EXISTING adam with the data from the form
//
exports.adamDelete = (adamId) => {
  global.show("###### adamDelete  ######");

  if (adamId) global.show(adamId);

  return new Promise(async (resolve, reject) => {
   
    try{

    adamTable = null;
    adamTable = await Models.adamModel.findOneAndDelete({ _id: adamId });
    // Check that adam allready exist based _id

    // IF he exist then DELETE the adam

    // global.saveLog(
    //   global.adminNick,
    //   adamTable.investorName,
    //   adamTable.investmentNo,
    //   "Deleted transaction: " +
    //     formatDateTime(adamTable._id) +
    //     " " +
    //     adamTable.desctiption
    // );
    if (adamTable) return resolve({ err: false, adams: adamTable });
    return reject({
      err: true,
      message: "Error in adam deletion,please check your id!",
    });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

//
// List all from adam collection
//
exports.adamList = () => {
  global.show("###### adamList ######");

  return new Promise(async (resolve, reject) => {
    try{
    adamTable = null;
    adamTable = await Models.adamModel.find().sort({ _id: 1 });

    if (adamTable) return resolve({ err: false, adams: adamTable });
    return reject({ err: true, message: "Unable to receive Adam list!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

//
// Update EXISTING adam with the data from the form
//
exports.adamUpdate = (req) => {
  global.show("###### adamSave ######");
  let received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    try{
    // check recieved._id exists
    const adamExists = await Models.adamModel.exists({ _id: received?._id });

    if (!adamExists)
      return reject({
        err: true,
        message: `Adam id ${received._id} is not exist!`,
      });

    adamTable = null;

    adamTable = await Models.adamModel.findOneAndUpdate(
      { _id: received._id },
      received,
      { new: true }
    );
    // Update the adam in "adam" collection
    // global.saveLog(
    //   global.adminNick,
    //   "ADAM",
    //   adamTable.investorName,
    //   adamTable.investmentNo,
    //   "Updated transaction: " +
    //     formatDateTime(adamTable._id) +
    //     " " +
    //     adamTable.desctiption
    // );

    if (adamTable) return resolve({ err: false, adams: adamTable });
    return reject({ err: true, message: "Unable to update Adam!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
  
};

exports.adamInvestors = async () => {
  global.show("###### adamInvestors  ######");

  return new Promise(async (resolve, reject) => {
    try{
    const investorsNames = await Models.Investor.find({}, "_id");

    const investments = await Models.investmentModel.find(
      {},
      "_id Explanation"
    );

    adamTable = null;
    adamTable = { investorsNames, investments };
    if (adamTable)return resolve({ err: false, adams: adamTable });
    return reject({err:true,message:"Unable to return your required data"})
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
