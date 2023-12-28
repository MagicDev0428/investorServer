import { Models } from "../../models";
const factory = require("../../utils/factories/google");
// creating investor table model
let investorTable = Models.Investor;

exports.deleteInvestor = async (_id) => {
  global.show("###### deleteInvestor ######");

  return new Promise(async (resolve, reject) => {
    try {
      investorTable = null; // intializing table values null
      investorTable = await Models.Investor.findById(_id);
       // create folder in google drive
      // Get the google drive client
      const client = factory.getGoogleDriveInstance();
      // Rename the investor folder by _Del + "<investor>"
      let res = await client.renameFolder(
        investorTable.investorFolderId, 
        "_Del " + _id
      );
      investorTable = await Models.Investor.findByIdAndDelete(_id); // passing id in delete function and storing response in investor table

     
      // checking that investor exist or not
      if (!investorTable) {
        return reject({
          err: true,
          message: "Investor id " + _id + " Not Found!",
        });
      }

      // if investor exist then return all data
      return resolve({ err: false, investors: investorTable });
    } catch (error) {
      return reject({ err: true, message: error.message });
    }
  });
};
