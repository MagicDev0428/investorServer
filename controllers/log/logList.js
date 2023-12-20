import {
    Models
} from "../../models";
// creating investor table model
let logTable = Models.logModel;


//
// List all the logs using search params
//
export const logList = (req) => {

    global.show("###### logList ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    // Input from recieved:
    // - several fields that the user can use to search

    return new Promise(async (resolve, reject) => {
        try {
            logTable = null;
            logTable = await Models.logModel.find().sort({
                _id: 1
            });

            if (logTable) {
                return resolve({
                    err: false,
                    logs: logTable
                });
            }
            return reject({
                err: true,
                message: "Unable to receive Logs list!"
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });

}