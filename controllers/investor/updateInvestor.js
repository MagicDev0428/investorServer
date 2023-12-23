// Update investor controller


import { Models } from '../../models';
import { Lib } from '../../utils';
const validator = require("validator");

// creating investor table model
let investorTable = Models.Investor;

exports.updateInvestor = (req) => {
  global.show("###### investor Update  ######");
  const received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {

    try{
    // validating id and nickname are exist or not
    if (!received._id || !received.nickname) {

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

    const dateTime = new Date().toISOString();
    received.modifiedDate = dateTime;

     // getting user name from auth token
    const userName = Lib.getAdminName(req.auth);

    received.modifiedBy = userName?userName:"";

 

    if (received?._oldId) {
      // Check if the new "_id" already exists
      const existingInvestor = await Models.Investor.findById(received._id);
      if (existingInvestor) {
        return reject({
          err: true,
          message: "Your new Investor Id already exists!",
        });
      }
      if(!received.pincode){
        // Adding pin to the received object
        received.pincode = Lib.pingenerator();

      }

      // Create a new document with the desired _id
      const newInvestor = new Models.Investor(received);


      // Save the new document
      investorTable = null;
      investorTable = await newInvestor.save();

      //  DELETE the investor with _oldId
      await Models.Investor.findOneAndDelete({
        _id: received._oldId,
      });
      // Update myInvestment collection against new id
      await Models.myInvestmentsModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );

      // Update balance collection against new id
      await Models.balanceModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }
      );

      // update log collection against new id
      await Models.logModel.updateMany(
        { investorName: received._oldId },
        { $set: { investorName: received._id } }       
      )
    } else {
      // checking if pincode exist then delete it
      if (received.pincode) delete received.pincode;

      // Update the existing document
      investorTable = null;
      investorTable = await Models.Investor.findOneAndUpdate(
        { _id: received._id },
        received,
        { new: true }
      );
    }

    // Return investor update data
    if (investorTable) {
      return resolve({ err: false, investors: investorTable });
    }
    
    return reject({ err: true, message: "Unable to update investor!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
