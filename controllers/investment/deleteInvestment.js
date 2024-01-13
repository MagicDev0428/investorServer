//
// Get  Investment
//

import {
    Models
} from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel


//
// Delete EXISTING investment with the data from the form
//
export const deleteInvestment = (investmentId) => {
    global.show("###### investmentDelete  ######");

    if (investmentId) global.show(investmentId);

    return new Promise(async (resolve, reject) => {

        try {
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
                    message: "Investment already have investors who put money into it.  Please remove them before you delete the investment.",
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

            
            if (investmentTable) {
                // this is for investment profit logs 
                let investmentProfit
                if(investmentTable.investType =='Monthly Profit' ||investmentTable.investType =='Mixed'  ){
                    investmentProfit = investmentTable.profitMonthly
                }else if(investmentTable.investType =='Annual Profit' || investmentTable.investType =='One-time Profit'){
                    investmentProfit = investmentTable.profitYearly
                }
                 // save log for to create investment 
                global.saveLogs({
                    logType:'Investment',
                    investmentNo:investmentTable._id,
                    description:`Delete Investment ${investmentTable._id} for ${investmentTable.investAmount} paying ${investmentProfit}%`,
                })
                return resolve({
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({
                err: true,
                message: "Error in investment deletion,please check your id!",
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};