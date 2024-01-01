//
// Create balances
//

import {
    Models
} from "../../models";

import{Lib} from "../../utils"
// creating Balance table model
let balanceTable = Models.balanceModel;



//
// Create NEW Balance with the data from the form
//
export const createBalance = (req) => {

    global.show("###### Create Balance ######")
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
                    message: "Balance form is empty!",
                });
            }


            if(!received.profitMonth || !received.investorName){
                return reject({
                    err: true,
                    message: "Check balance form investorName and profitMonth are required!",
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


              // check recieved.investorName exist in investors or not
            const investorExist = await Models.Investor.exists({
                _id: received.investorName
            });

           
            if (!investorExist){
                return reject({
                    err: true,
                    message: `Investor id ${received.investorName} is not exist in investor collection!`,
                });
            }


            // creating new balances instance
            const newbalances = new Models.balanceModel(received);

            balanceTable = null;
            balanceTable = await newbalances.save();

            // Create the balances in "balances" collection

            if (balanceTable) {
                return resolve({
                    err: false,
                    balances: balanceTable
                });
            }
            return reject({
                err: true,
                message: "Unable to create balances!"
            })

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}