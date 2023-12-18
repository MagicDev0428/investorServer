//
// Get  Investment
//

import { Models } from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel


//
// Delete EXISTING investment with the data from the form
//
exports.deleteInvestment = (investmentId) => {
  global.show("###### investmentDelete  ######");

  if (investmentId) global.show(investmentId);

  return new Promise(async (resolve, reject) => {

    try{
        if (!investmentId) {
            return reject({
                status: 404,
                err: true,
                message: "Investment id is not recievied",
            });
        }

        // checking id exists in myInvestments
        const myInvestmentExists = await Models.myInvestmentsModel.exists({
            investmentNo: investmentId,
        });

        if (myInvestmentExists) {
            return reject({
                status: 403,
                err: true,
                message: "Investment already have investors",
            });
        }

        // checking id exists in adams

        const adamExists = await Models.adamModel.exists({
            investmentNo: investmentId,
        });

        if (adamExists) {
            return reject({
                status: 403,
                err: true,
                message: "Investment already have adam transactions.",
            });
        }
        // Check that investment allready exist based _id

        // IF he exist then DELETE the investment
        investmentTable = null;
        investmentTable = await Models.investmentModel.findOneAndDelete({
             _id: investmentId,
        });

        // global.saveLog(
        //   global.adminNick,
        //   investmentTable.investorName,
        //   investmentTable.investmentNo,
        //   "Deleted transaction: " +
        //     formatDateTime(investmentTable._id) +
        //     " " +
        //     investmentTable.desctiption
        // );
        if (investmentTable){
            return resolve({ err: false, investments: investmentTable });
        }
        return reject({
            err: true,
            message: "Error in investment deletion,please check your id!",
        });
     } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};