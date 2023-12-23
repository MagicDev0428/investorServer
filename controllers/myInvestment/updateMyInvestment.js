//
// Update Investment
//
import {
    Models
} from "../../models";

import { Lib } from "../../utils";
// creating table model
let myInvestmentTable = Models.myInvestmentsModel;

//
// Update EXISTING my investment with the data from the form
//
export const updateMyInvestment = (req) => {
    global.show("###### my investment update ######");
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {

        try {
            // check recieved._id exists
            const myInvestmentExists = await Models.myInvestmentsModel.exists({
                _id: received?._id,
            });

            if (!myInvestmentExists) {
                return reject({
                    status:403,
                    err: true,
                    message: `myInvestment id ${received._id} is not exist!`,
                });
            }

            // checking id exists in myInvestments
            const investmentExists = await Models.investmentModel.exists({
                _id: received.investmentNo
            });
            if (!investmentExists) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investment No does not exist!",
                });
            }
            // checking id exists in myInvestments
            const investorExists = await Models.Investor.exists({
                _id: received.investorName
            });
            if (!investorExists) {
                return reject({
                    status: 403,
                    err: true,
                    message: "Investor id does not exist!",
                });
            }


            const dateTime = new Date().toISOString();
            received.modifiedDate = dateTime;
           // getting user name from auth token
            const userName = Lib.getAdminName(req.auth);

            received.modifiedBy = userName?userName:"";

            myInvestmentTable = null;

            myInvestmentTable = await Models.myInvestmentsModel.findByIdAndUpdate(received._id, received, {
                new: true,
            });
            // Update the investment in "investment" collection
            // global.saveLog(
            //   global.adminNick,
            //   "investment",
            //   myInvestmentTable.investorName,
            //   myInvestmentTable.investmentNo,
            //   "Updated transaction: " +
            //     formatDateTime(myInvestmentTable._id) +
            //     " " +
            //     myInvestmentTable.desctiption
            // );

            if (myInvestmentTable) {
                return resolve({
                    status: 200,
                    err: false,
                    myInvestments: myInvestmentTable
                });
            }
            return reject({
                status: 404,
                err: true,
                message: `Investment ${_id} Not Found!`,
            });

        } catch (error) {
            return reject({
                status:500,
                err: true,
                message: error.message
            })
        }
    });
};