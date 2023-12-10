// Update investor controller

const validator = require("validator");
const mongoose = require("mongoose");
const { investorModel } = require("../../models/investor/investorModel");
const { pingenerator } = require("../../utils/pingenerator");
const { investorSchema } = require("../../schema/investor/investorSchema");
const {
  myInvestmentsModel,
} = require("../../models/investor/myInvestmentsModel");
const { balanceModel } = require("../../models/investor/balanceModel");

// creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

//
// Update EXISTING investor with the data from the form
//

//minmum request body data
//'{
//     "_id":"tiHold new",
//     "_oldId":"tiHold",
//     "nickName":"tiHold reuo",
//
// }
//   * no need to add admin, it will automtically become false even you will add it in request body
//   * you can exclude the _oldId if you do not want to update user id and for other values of investor
//   go to investor schema

exports.updateInvestor = (req) => {
  global.show("###### investor Update  ######");
  const received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    // validating id and nickname are exist or not

    if (!received._id || !received.nickName) {
      return reject({
        err: true,
        message: "_id and nickname are required!",
      });
    }

    // Removing admin if it exists in the body
    if (received.admin) delete received.admin;

    if (received?._oldId) {
      // Check if the new "_id" already exists
      const existingInvestor = await investorModel.findById(received._id);
      if (existingInvestor) {
        return reject({
          err: true,
          message: "Your new Investor Id already exists!",
        });
      }
      // Adding pin to the received object
      received.pincode = pingenerator();

      // Create a new document with the desired _id
      const newInvestor = new investorModel(received);

      // Save the new document
      investorTable = null;
      investorTable = await newInvestor.save();

      //  DELETE the investor with _oldId
      await investorModel.findOneAndDelete({
        _id: received._oldId,
      });
      // Update myInvestment collection against new id
      await myInvestmentsModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );

      // Update balance collection against new id
      await balanceModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );
    } else {
      // checking if pincode exist then delete it
      if (received.pincode) delete received.pincode;

      // Update the existing document
      investorTable = null;
      investorTable = await investorModel.findOneAndUpdate(
        { _id: received._id },
        received,
        { new: true }
      );
    }

    // Return investor update data
    if (investorTable) return resolve({ err: false, investors: investorTable });
    return reject({ err: true, message: "Unable to update investor!" });
  });
};
