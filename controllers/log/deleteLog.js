import {
    Models
} from "../../models";
// creating investor table model
let logTable = Models.logModel;


export const deleteLog = async (_id) => {
    global.show("###### deleteInvestor ######");
    return new Promise(async (resolve, reject) => {
        try {

            logTable = null; // intializing table values null
            logTable = await Models.logModel.findByIdAndDelete(_id); // passing id in delete function and storing response in investor table

            // checking that investor exist or not
            if (!logTable) {
                return reject({
                    err: true,
                    message: "Investor id " + _id + " Not Found!",
                });
            }

            // if investor exist then return all data
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