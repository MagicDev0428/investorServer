import {
    Models
} from "../../models";
// creating balance table model
let logTable = Models.logModel;

export const investorLogs = (investorId)=>{
     global.show("###### Get Log ######");
    if (investorId) global.show(investorId);


    return new Promise(async (resolve, reject) => {
        try{
            // Check for received data
            if (!investorId) {
                return reject("Investor Id is required to get all logs!!");
            }


            logTable = null;
            logTable = await Models.logModel.find({investorName:investorId})
            if (!logTable) {
                return reject({
                    err: true,
                    message: "logs of investor " + investorId + "Not Found!"
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
    })
}