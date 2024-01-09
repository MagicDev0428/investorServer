//
// Get Investor
//

import { Models } from "../../models"; 
// creating investor table model
let investorTable = Models.Investor;


exports.investorGet = (id) => {
  global.show("###### investorGet ###### ");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    try{
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id" });
    }

    investorTable = null; // intializing table values null
    investorTable = await Models.Investor.findOne({ _id: id }); // storing values in table

    // checking that investor exist or not
    if (!investorTable) {
      return reject({ err: true, message: "Investor " + id + " Not Found!" });
    }

    // if investor exist then return all data
    return resolve({ err: false, investors: investorTable });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};


exports.getInvestorNickName = (id) => {
  global.show("###### Get investor nick name ###### ");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    try{
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id" });
    }

    investorTable = null; // intializing table values null
    investorTable = await Models.Investor.findOne({ _id: id }).select('nickname'); // storing values in table

    // checking that investor exist or not
    if (!investorTable) {
      return reject({ err: true, message: "Investor " + id + " Not Found!" });
    }

    // if investor exist then return all data
    return resolve({ err: false, investors: investorTable });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
