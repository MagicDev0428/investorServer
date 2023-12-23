import {
    Models
} from "../../models";
// creating myInvestment table model
let myInvestmentTable = Models.myInvestmentsModel;




export const getMyInvestment = (myInvestmentId) => {
    global.show("###### Get myInvestment ######");
    if (myInvestmentId) global.show(myInvestmentId);


    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!myInvestmentId) {
                return reject("myInvestment Id is not recieved.");
            }

            myInvestmentTable = null;
            myInvestmentTable = await Models.myInvestmentsModel.findOne({
                _id: myInvestmentId
            });
            if (!myInvestmentTable) {
                return reject({
                    status:404,
                    err: true,
                    message: "myInvestment " + myInvestmentId + "Not Found!"
                });
            }

            return resolve({
                status:201,
                err: false,
                myInvestments: myInvestmentTable
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