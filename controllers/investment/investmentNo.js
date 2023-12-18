//
// Get investment no 
//

import { Models } from '../../models';

// // creating Investment table model
let investmentTable = Models.investmentModel
export const investmentNo = async () => {
    global.show("###### Investment No ######");

    return new Promise(async (resolve, reject) => {
        try {
           

            const count = await Models.investmentModel.countDocuments({});
            investmentTable = count + 1;
            if (investmentTable) {
                return resolve({ err: false, investmentNo: investmentTable });
            } else {
                return reject({ err: true, message: "Error in getting investment no!" });
            }
        } catch (error) {
            return reject({ err: true, message: error.message });
        }
    });
};