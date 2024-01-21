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
// List all from investment collection
//
export const investmentList = () => {
    global.show("###### List of Investments ######");

    return new Promise(async (resolve, reject) => {
        try {

             
            investmentTable = null;
            investmentTable = await Models.investmentModel.find().sort({
                _id: 1
            }).lean();


            if (investmentTable ) {
               
                // adding new property investment ends 
        investmentTable = investmentTable.map(investment => ({
                    ...investment,
                    investmentEnds: Lib.calculateDays(investment.startDate, investment.endDate)
                }));
                return resolve({
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({ 
                err: true,
                message: "Unable to receive investment list!"
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};

