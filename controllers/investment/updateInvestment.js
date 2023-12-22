//
// Update Investment
//
import {
    Models
} from "../../models";

import { Lib } from "../../utils";
// creating table model
let investmentTable = Models.investmentModel;

//
// Update EXISTING investment with the data from the form
//
export const updateInvestment = (req) => {
    global.show("###### investmentSave ######");
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {

        try {
            // check recieved._id exists
            const investmentExists = await Models.investmentModel.exists({
                _id: received?._id,
            });

            if (!investmentExists) {
                return reject({
                    err: true,
                    message: `investment id ${received._id} is not exist!`,
                });
            }


            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;
           // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName?userName:"";

            investmentTable = null;

            investmentTable = await Models.investmentModel.findByIdAndUpdate(received._id, received, {
                new: true,
            });
            // Update the investment in "investment" collection
            // global.saveLog(
            //   global.adminNick,
            //   "investment",
            //   investmentTable.investorName,
            //   investmentTable.investmentNo,
            //   "Updated transaction: " +
            //     formatDateTime(investmentTable._id) +
            //     " " +
            //     investmentTable.desctiption
            // );

            if (investmentTable) {
                return resolve({
                    status: 200,
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({
                status: 404,
                err: true,
                message: `Investment ${_id} Not Found!`,
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};