//
// Update Investment
//
import { Models } from "../../models";

// creating table model
let investmentTable = Models.investmentModel;


//
// List all from investment collection
//
exports.investmentList = () => {
  global.show("###### List of Investments ######");

  return new Promise(async (resolve, reject) => {
    try{
        investmentTable = null;
        investmentTable = await Models.investmentModel.find().sort({ _id: 1 });

        if (investmentTable){
            return resolve({ err: false, investments: investmentTable });
        }
        return reject({ err: true, message: "Unable to receive investment list!" });

     } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};