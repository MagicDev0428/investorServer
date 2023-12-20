import {
    Models
} from "../../models";
// creating balance table model
let logTable = Models.logModel;




export const getLog = (logId) => {
    global.show("###### Get Log ######");
    if (logId) global.show(logId);


    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!logId) {
                return reject("Id is not recieved.");
            }

            logTable = null;
            logTable = await Models.logModel.findOne({
                _id: logId
            });
            if (!logTable) {
                return reject({
                    err: true,
                    message: "log " + logId + "Not Found!"
                });
            }

            return resolve({
                err: false,
                logs: logTable
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};