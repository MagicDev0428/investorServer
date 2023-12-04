//
// Get Investor
//

const mongoose = require("mongoose");
let { investorModel } = require("../../models/investor/investorModel");
const { investorSchema } = require("../../schema/investor/investorSchema");

// creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

//
// Getting back investor from id
//
exports.investorGet = (id) => {
  global.show("###### investorGet ######");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id" });
    }

    investorTable = null; // intializing table values null
    investorTable = await investorModel.findOne({ _id: id }); // storing values in table

    // checking that investor exist or not
    if (!investorTable) {
      return reject({ err: true, message: "Investor " + id + " Not Found!" });
    }

    // if investor exist then return all data
    return resolve({ err: false, investors: investorTable });
  });
};
