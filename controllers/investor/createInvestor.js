//
// Create Investor
//

const validator = require("validator");
const mongoose = require("mongoose");
let { investorModel } = require("../../models/investor/investorModel");
const { pingenerator } = require("../../utils/pingenerator");
const { investorSchema } = require("../../schema/investor/investorSchema");

// creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

//
// Create NEW investor with the data from the form
//
// url => http://localhost:3007/investor/createinvestor

// minmum body data
// {
//     "_id":"TimHold",
//     "nickName":"Tim"
// }
// to add other data first check the investor schema
//
//
exports.investorCreate = async (req) => {
  global.show("###### investorCreate ######");
  const received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    // Checking if investor body is empty or not
    if (!received) {
      return reject({
        err: true,
        message: "Investor form is empty!",
      });
    }

    // Checking if user id and nickname are provided
    if (!received._id || !received.nickName) {
      return reject({
        err: true,
        message: "Id and nickname are required!",
      });
    }

    // Validating email
    if (
      (received?.email && !validator.isEmail(received?.email)) ||
      (received?.beneficiaryEmail &&
        !validator.isEmail(received?.beneficiaryEmail))
    ) {
      return reject({
        err: true,
        message: "Invalid Email or beneficiaryEmail address!",
      });
    }

    // Check if the investor already exists
    const existingInvestor = await investorModel.findOne({
      _id: received._id,
    });
    if (existingInvestor) {
      return reject({
        err: true,
        message: "Investor with this _id already exists!",
      });
    }

    // Adding pin to the received object
    received.pincode = pingenerator();

    // Creating a new investor instance
    const newInvestor = new investorModel(received);

    // Saving investor data in the collection
    investorTable = null;
    investorTable = await newInvestor.save();

    return resolve({ err: false, investors: investorTable });
  });
};
