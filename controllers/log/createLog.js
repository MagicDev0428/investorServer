//
// Create Log
//

import {
    Models
} from "../../models";


// creating Log table model
let logTable = Models.logModel;



//
// Create NEW log with the data from the form
//
export const createLog = (req) => {

    global.show("###### logCreate ######")
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
                    message: "log form is empty!",
                });
            }

            // creating unixx date id
            received._id = new Date().getTime()

            // creating new log instance
            const newlog = new Models.logModel(received);

            logTable = null;
            logTable = await newlog.save();

            // Create the log in "log" collection

            if (logTable) {
                return resolve({
                    err: false,
                    logs: logTable
                });
            }
            return reject({
                err: true,
                message: "Unable to create log!"
            })

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}