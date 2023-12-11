//
// Adam Controller
//

const mongoose = require("mongoose");
const { adamModel } = require("../../models/adam/adamModel");
const { adamSchema } = require("../../schema/adam/adamSchema");
const { investorModel } = require("../../models/investor/investorModel");
const {
  myInvestmentsModel,
} = require("../../models/investor/myInvestmentsModel");
const { investmentModel } = require("../../models/investmentModel");

// creating adam table model
let adamTable = mongoose.model("adam", adamSchema);

//
// Create NEW adam with the data from the form
//

exports.adamCreate = (req) => {
  global.show("###### adamCreate ######");
  let received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    // Checking if investor body is empty or not
    if (!received) {
      return reject({
        err: true,
        message: "Adam form is empty!",
      });
    }

    // payload has investor name and investment no
    if (!received.investorName || !received.investmentNo) {
      return reject({
        err: true,
        message:
          "In adam investor name and investment number both are required.",
      });
    }

    //  investorName and Investment number exists

    const investorExists = await investorModel.exists({
      _id: received?.investorName,
    });

    const investmentExists = await investmentModel.exists({
      _id: received.investmentNo,
    });

    if (!investorExists || !investmentExists) {
      return reject({
        err: true,
        message: "Referenced investor and investment do not exist!",
      });
    }

    // Unixx date as an id
    received._id = new Date().getTime();

    // creating new adam instance
    const newAdam = new adamModel(received);

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
    // Check for received data
    if (!adamId) {
      return reject("Id is not recieved.");
    }

    adamTable = null;
    adamTable = await adamModel.findOne({ _id: adamId });
    if (!adamTable) {
      return reject("adam " + adamId + "Not Found!");
    }

    return resolve({ err: false, adams: adamTable });
  });
};

//
// Delete EXISTING adam with the data from the form
//
exports.adamDelete = (adamId) => {
  global.show("###### adamDelete  ######");

  if (adamId) global.show(adamId);

  return new Promise(async (resolve, reject) => {
    adamTable = null;
    adamTable = await adamModel.findOneAndDelete({ _id: adamId });
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
  });
};

//
// List all from adam collection
//
exports.adamList = () => {
  global.show("###### adamList ######");

  return new Promise(async (resolve, reject) => {
    adamTable = null;
    adamTable = await adamModel.find().sort({ _id: 1 });

    if (adamTable) return resolve({ err: false, adams: adamTable });
    return reject({ err: true, message: "Unable to receive Adam list!" });
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
    // check recieved._id exists
    const adamExists = await adamModel.exists({ _id: received?._id });

    if (!adamExists)
      return reject({
        err: true,
        message: `Adam id ${received._id} is not exist!`,
      });

    // payload has investor name and investment no
    if (!received.investorName || !received.investmentNo) {
      return reject({
        err: true,
        message:
          "In adam investor name and investment number both are required.",
      });
    }

    //  investorName and Investment number exists

    const investorExists = await investorModel.exists({
      _id: received?.investorName,
    });

    const investmentExists = await investmentModel.exists({
      _id: received.investmentNo,
    });

    if (!investorExists || !investmentExists) {
      return reject({
        err: true,
        message: "Referenced investor and investment do not exist!",
      });
    }

    adamTable = null;

    adamTable = await adamModel.findOneAndUpdate(
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
  });
};

exports.adamInvestors = async () => {
  global.show("###### adamInvestors  ######");

  return new Promise(async (resolve, reject) => {
    const investorsNames = await investorModel.find({}, "_id");

    const investmentValues = await investmentModel.find({}, "_id Explanation");
    const investments = investmentValues.map(
      (item) => `${item._id}  ${item.Explanation}`
    );
    adamTable = null;
    adamTable = { investorsNames, investments };
    return resolve({ err: false, adams: adamTable });
  });
};
