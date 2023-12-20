import {
    Models
} from "../../models";
// creating Log table model
let logTable = Models.logModel;


export const deleteLog = async (_id) => {
    global.show("###### delete Log ######");
    return new Promise(async (resolve, reject) => {
        try {

            logTable = null; // intializing table values null
            logTable = await Models.logModel.findByIdAndDelete(_id); // passing id in delete function and storing response in Log table

            // checking that Log exist or not
            if (!logTable) {
                return reject({
                    err: true,
                    message: "Log id " + _id + " Not Found!",
                });
            }

            // if Log exist then return all data
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