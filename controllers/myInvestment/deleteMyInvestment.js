import { Models } from "../../models"; 
// creating investor table model
let myInvestmentTable = Models.myInvestmentsModel;


export const deleteMyInvestment = async (_id) => {
  global.show("###### deleteInvestor ######");
   return new Promise(async (resolve, reject) => {
      try{

    myInvestmentTable = null; // intializing table values null
    myInvestmentTable = await Models.myInvestmentsModel.findByIdAndDelete(_id); // passing id in delete function and storing response in investor table

    // checking that investor exist or not
    if (!myInvestmentTable) {
      return reject({
        err: true,
        message: "Investor id " + _id + " Not Found!",
      });
    }

    // if investor exist then return all data
    return resolve({ err: false, investors: myInvestmentTable });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
   })
}