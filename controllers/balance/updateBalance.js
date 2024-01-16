import {
    Models
} from "../../models";

import { Lib } from "../../utils";
const {getInvestorNickName} = require("../investor/getInvestor")
// creating balance table model
let balanceTable = Models.balanceModel;


//
// Update EXISTING Balance with the data from the form
//
export const updateBalance = (req) => {

    global.show("###### update balance ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!received._id) {
                return reject({err:true,message:"_id is not recieved in form."});
            }

            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;

           // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName?userName:"";


            balanceTable = null;
            balanceTable = await Models.balanceModel.findOneAndUpdate({
                    _id: received._id
                },
                received, {
                    new: true
                }
            );

            if(!balanceTable){
                return reject({
                    err:true,
                    message:`Balance id ${balanceId} is not exist!`
                })
            }
            // get investor nick name
            let  {investors} = await getInvestorNickName(balanceTable.investorName)
           
            // save log for update adam
            global.saveLogs({
                logType:'Balance',
                investorName:investors.nickname,
                description:`Update Balance from ${investors.nickname} for ฿${balanceTable.deposit.toLocaleString()}.`,
            })
            
            return resolve({
                err: false,
                balances: balanceTable
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}