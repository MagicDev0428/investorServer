import {
    Models
} from "../../models";
// creating investor table model
let investorTable = Models.Investor;


export const totalMyInvestment = (investorId) => {
    global.show("###### Get investor total investment ###### ");

    if (investorId) global.show(investorId);

    return new Promise(async (resolve, reject) => {
        try {
            const currentDate = new Date();
            // Check for id
            if (!investorId) {
                return reject({
                    err: true,
                    message: "Didn't get investor id"
                });
            }

            const investorExist = await Models.Investor.exists({
                _id: investorId
            });
            if (!investorExist) {
                return reject({
                    err: true,
                    message: "Investor does not exist!!"
                });
            }


            investorTable = null;
            investorTable = await Models.myInvestmentsModel.aggregate([{
                    $match: {
                        investorName: investorId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmountInvested: {
                            $sum: {
                                $cond: {
                                    if: {
                                        $and: [{
                                                $lte: ["$firstProfitDate", currentDate]
                                            },
                                            {
                                                $gte: ["$lastProfitDate", currentDate]
                                            }
                                        ]
                                    },
                                    then: "$amountInvested",
                                    else: 0
                                }
                            }
                        }
                    }
                }
            ]);
            // checking if investor data exist then resolve the promise otherwise reject it
            if (investorTable) {

                const totalinvestment = investorTable.length !== 0 ? investorTable[0].totalAmountInvested : 0;
                return resolve({
                    err: false,
                    totalInvested: totalinvestment
                });

            }


            return reject({
                err: true,
                message: "Unable to get investor info!"
            });


        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
}