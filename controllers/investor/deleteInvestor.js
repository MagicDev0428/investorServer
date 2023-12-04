const mongoose = require("mongoose");
const { investorModel } = require("../../models/investor/investorModel");
const { investorSchema } = require("../../schema/investor/investorSchema");

// creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

//
// Delete investor with id
//

//
// url => http://localhost:3007/investor/deleteinvestor/id
// in URL params at id replace with your id
//
exports.deleteInvestor = async (_id) => {
  global.show("###### deleteInvestor ######");

  return new Promise(async (resolve, reject) => {
    investorTable = null; // intializing table values null
    investorTable = await investorModel.findByIdAndDelete(_id); // passing id in delete function and storing response in investor table

    // checking that investor exist or not
    if (!investorTable) {
      return reject({
        err: true,
        message: "Investor id " + _id + " Not Found!",
      });
    }

    // if investor exist then return all data
    return resolve({ err: false, investors: investorTable });
  });
};
