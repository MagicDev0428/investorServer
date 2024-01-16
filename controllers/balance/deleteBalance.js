import {
    Models
} from "../../models";
const {getInvestorNickName} = require("../investor/getInvestor")
// creating Balance table model
let balanceTable = Models.balanceModel;


export const deleteBalance = async (_id) => {
    global.show("###### delete balance ######");
    return new Promise(async (resolve, reject) => {
        try {

            balanceTable = null; // intializing table values null
            balanceTable = await Models.balanceModel.findByIdAndDelete(_id); // passing id in delete function and storing response in balance table

            // checking that balance exist or not
            if (!balanceTable) {
                return reject({
                    err: true,
                    message: "Balance id " + _id + " Not Found!",
                });
            }

            let  {investors} = await getInvestorNickName(balanceTable.investorName)
                
            global.saveLogs({
                logType:'Balance',
                investorName:investors.nickname,
                description:`Delete Deposit from ${investors.nickname} for ฿${balanceTable.deposit.toLocaleString()}.`,
            })

            // if balance exist then return all data
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