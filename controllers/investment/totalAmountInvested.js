import {
    Models
} from "../../models";
let investmentTable = Models.investmentModel
export const totalAmountInvested = (investmentId) => {
    global.show("###### Get total amount invested ###### ");

    if (investmentId) global.show(investmentId);

    return new Promise(async (resolve, reject) => {
        try {
            
            // Check for id
            if (!investmentId) {
                return reject({
                    err: true,
                    message: "Didn't get investment id"
                });
            }

            const investmentExist = await Models.investmentModel.exists({
                _id: investmentId
            });
            if (!investmentExist) {
                return reject({
                    err: true,
                    message: "investment does not exist!!"
                });
            }


            investmentTable = null;
            
            investmentTable = await Models.myInvestmentsModel.aggregate([
                  { $match: { investmentNo: Number(investmentId) } },
                    {
                        $group: {
                            _id: null,
                            totalAmountInvested: { $sum: "$amountInvested" }
                        }
                    }
            ]);
            
            // checking if investor data exist then resolve the promise otherwise reject it
            if (investmentTable) {

                console.log(investmentTable)
                const totalinvestment = investmentTable.length !== 0 ? investmentTable[0].totalAmountInvested : 0;
                return resolve({
                    status:200,
                    err: false,
                    totalAmountInvested: totalinvestment
                });

            }


            return resolve({
                status:204,
                err: false,
                totalAmountInvested: []
            });


        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
}