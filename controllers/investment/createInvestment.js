//
// Create Investment
//

import {
    Models
} from '../../models';

import { Lib } from '../../utils';
// creating Investment table model
let investmentTable = Models.investmentModel


//
// Create NEW investment with the data from the form
//

export const createInvestment = (req) => {
    global.show("###### investmentCreate ######");
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {

        try {
            // Checking if investor body is empty or not
            if (!received) {
                return reject({
                    err: true,
                    message: "investment form is empty!",
                });
            }

            // investment id is required
            if (!received._id) {
                return reject({
                    err: true,
                    message: "investment id is empty!",
                });
            }


            // date and time in createDate and modified date
            const dateTime = new Date().toISOString();
            received.createdDate = dateTime;
            received.modifiedDate =dateTime;

            // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.createdBy = userName?userName:"";
            received.modifiedBy = userName?userName:"";

            // checking investment recieved._id already exists
            const investmentExists = await Models.investmentModel.exists({
                _id: received?._id,
            });
            if (investmentExists)
                return reject({
                    err: true,
                    message: `Investment id ${received._id} is already exist!`,
                });

            // received._id = new Date().getTime();
            // creating new investment instance
            const newinvestment = new Models.investmentModel(received);

            investmentTable = null;
            investmentTable = await newinvestment.save();

           

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
                    description:`New Investment ${investmentTable._id} for ${investmentTable.investAmount} paying ${investmentProfit}%`,
                })

                return resolve({
                    status: 201,
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({
                status: 500,
                err: true,
                message: "Error in investment creation!",
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};