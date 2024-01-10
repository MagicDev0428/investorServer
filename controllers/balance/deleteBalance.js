import {
    Models
} from "../../models";
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

            global.saveLogs({
                logType:'Balance',
                investorName:balanceTable.investorName,
                description:`Delete Deposit from ${balanceTable.investorName} for ${balanceTable.deposit}.`,
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