//
// Update Investment
//
import { Models } from "../../models";

// creating table model
let myInvestmentTable = Models.myInvestmentsModel;


//
// List all from myInvestment collection
//
export const myInvestmentList = () => {
  global.show("###### List of Investments ######");

  return new Promise(async (resolve, reject) => {
    try{
        myInvestmentTable = null;
        myInvestmentTable = await Models.myInvestmentsModel.find().sort({ _id: 1 });

        if (myInvestmentTable){
            return resolve({ err: false, myInvestments: myInvestmentTable });
        }
        return reject({ err: true, message: "Unable to receive investment list!" });

     } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};