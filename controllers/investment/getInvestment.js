//
// Get  Investment
//

import {
    Models
} from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel


//
// Get all data used on the investment form
//
exports.getInvestment = (investmentId) => {
    global.show("###### investmentGet ######");
    if (investmentId) global.show(investmentId);

    // Input from recieved:
    // - recieved._id (the investments unique key of investments collection)

    return new Promise(async (resolve, reject) => {
        try {
            // Check for received data
            if (!investmentId) {
                return reject({
                    error: true,
                    message: "Id is not recieved."
                });
            }

            investmentTable = null;
            investmentTable = await Models.investmentModel.findOne({
                _id: investmentId,
            });

            if (!investmentTable) {
                return reject({
                    err: true,
                    message: "investment " + investmentId + "Not Found!",
                });
            }

            return resolve({
                err: false,
                investments: investmentTable
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};