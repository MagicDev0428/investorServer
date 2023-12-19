//
// Create Investor
//

import { Models } from '../../models';
import { Lib } from '../../utils';
const validator = require("validator"); 


// creating investor table model
let investorTable = Models.Investor


exports.investorCreate = async (req) => {
  global.show("###### investorCreate ######");
  const received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {
    try{
    // Checking if investor body is empty or not
    if (!received) {
      return reject({
        err: true,
        message: "Investor form is empty!",
      });
    }

    // Checking if user id and nickname are provided
    if (!received._id || !received.nickname) {
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
    const existingInvestor = await Models.Investor.findOne({
      _id: received._id,
    });
    if (existingInvestor) {
      return reject({
        err: true,
        message: "Investor with this _id already exists!",
      });
    }

    // Adding pin to the received object
    received.pincode = Lib.pingenerator();

    const folderName = Lib.transformNameToPath(received._id);
    try {
      /* checking if a folder with name of the investor already exists */
      const isFolderNameTaken = await Lib.isInvestorFolderNameTaken(folderName);
      if (isFolderNameTaken === true) {
        return reject({
          err: true,
          message: "Folder with investor name already exists!",
        });
      }
      
    } catch (error) {
      console.log(error);
      return reject({
        err: true,
        message: "Can't ",
      });
    }


    // Creating a new investor instance
    const newInvestor = new  Models.Investor(received);

    // Saving investor data in the collection
    investorTable = null;
    investorTable = await newInvestor.save();
    if (investorTable) {return resolve({ err: false, investors: investorTable });}
    return reject({ err: true, message: "Error in investor creation!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
