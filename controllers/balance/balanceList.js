import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;


//
// List all the balances using search params
//
export const balanceList = (req) => {

    global.show("###### logList ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    // Input from recieved:
    // - several fields that the user can use to search

    return new Promise(async (resolve, reject) => {
        try {
            balanceTable = null;
            balanceTable = await Models.balanceModel.find().sort({
                _id: 1
            });

            if (balanceTable) {
                return resolve({
                    err: false,
                    balances: balanceTable
                });
            }
            return reject({
                err: true,
                message: "Unable to receive balances list!"
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });

}