import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;




export const getBalance = (balanceId) => {
    global.show("###### Get Balance ######");
    if (balanceId) global.show(balanceId);


    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!balanceId) {
                return reject("Balance Id is not recieved.");
            }

            balanceTable = null;
            balanceTable = await Models.balanceModel.findOne({
                _id: balanceId
            });
            if (!balanceTable) {
                return reject({
                    err: true,
                    message: "Balance " + balanceId + "Not Found!"
                });
            }

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
    });
};