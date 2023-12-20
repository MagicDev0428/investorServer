import {
    Models
} from "../../models";
// creating balance table model
let logTable = Models.logModel;


//
// Update EXISTING log with the data from the form
//
export const updateLog = (req) => {

    global.show("###### update log ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    // Input from recieved:
    // - recieved.*   (you get ALL fields in the logs collection)
    //
    // - recieved._id is required
    // 
    // with the rest of the fields, just fill them out as in log collection (see the logModel.js)
    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!received._id) {
                return reject("_id is not recieved.");
            }

            // Update the log in "log" collection
            // check recieved._id exists
            const logExist = await Models.logModel.exists({
                _id: received._id
            });

           
            if (!logExist){
                return reject({
                    err: true,
                    message: `Log id ${received._id} is not exist!`,
                });
            }

            const logId = received._id
            delete received._id             // deleting id so it will not update the document id

            logTable = null;
            logTable = await Models.logModel.findOneAndUpdate({
                    _id: logId
                },
                received, {
                    new: true
                }
            );
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
    })
}