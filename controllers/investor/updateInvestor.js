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
exports.updateInvestor = (req) => {
  global.show("###### investorSave ######");
  const received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    // const oldId = received._oldId ? : null;

    // checking _id, _oldId and nickName because they are required fileds
    if (!received._id || !received.nickName) {
      return reject({
        err: true,
        message: "_id and nickname are required!",
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

    // Removing admin if it exists in the body
    if (received.admin) delete received.admin;

    if (received._oldId) {
      // Check if the new "_id" already exists
      const existingInvestor = await investorModel.findById(received._id);
      if (existingInvestor) {
        return reject({
          err: true,
          message: "Your new Investor Id already exist! ",
        });
      }

      // //  DELETE the investor with _oldId
      // await investorModel.findOneAndDelete({
      //   _id: received._oldId,
      // });

      // updating myInvestment collection against new id
      await myInvestmentsModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );

      // updating balance collection against new id
      await balanceModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );
    }

    // Adding pin to the received object
    received.pincode = pingenerator();

    // // Creating a new investor instance with new id
    // const newInvestor = new investorModel(received);

    // // Saving investor updated data in the collection
    investorTable = null;
    investorTable = investorModel.findOneAndUpdate(
      {
        _id: received._oldId ? received._oldId : received._id,
      },
      received
    );
    // investorTable = await newInvestor.save();

    // return investor update data
    return resolve({ err: false, investors: investorTable });
  });
};
