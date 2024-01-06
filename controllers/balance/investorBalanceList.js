import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;

const investorBalance = (investorId) => {
    const today = new Date();
    return [{
            $sort: {
                "profitMonth": 1
            } // Sorting in ascending order, adjust as needed
        },
        {
            $group: {
                _id: null,
                totalDeposit: {
                    $sum: '$deposit'
                },
                // totalMonthlyProfit: { $sum: '$accountInvestments.totalProfitMonthly' },
                investorBalanceLists: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $unionWith: {
                coll: "myInvestments", // The name of the MyInvestment collection
                pipeline: [{
                        $match: {
                            investorName: investorId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalMonthlyProfit: {
                                // $sum: "$profitMonthly"
                                $sum: {
                                    $cond: [{
                                            $and: [{
                                                    $lte: ["$firstProfitDate", today]
                                                },
                                                {
                                                    $gte: ["$lastProfitDate", today]
                                                }
                                            ]
                                        },
                                        "$profitMonthly",
                                        0
                                    ]
                                }
                            },

                        }
                    },


                ]
            }
        },
    ];
};


export const investorBalanceList = (investorId) => {
    global.show("###### Get Balance ######");
    if (investorId) global.show(investorId);

    return new Promise(async (resolve, reject) => {
        try {
            // Check for received data
            if (!investorId) {
                return reject("Investor Id is not recieved for balance list.");
            }

            // Check if the _id exists
            const existingInvestor = await Models.Investor.findById(investorId);

            if (!existingInvestor) {
                return reject({
                    err: true,
                    message: "Your Investor Id does not exist for investor list!"
                });
            }
            const pipeline = [{
                    $match: {
                        investorName: investorId
                    }
                },
                ...investorBalance(investorId), // Include common stages
            ];


            balanceTable = null;

            balanceTable = await Models.balanceModel.aggregate(pipeline);
            if (!balanceTable) {
                return reject({
                    err: true,
                    message: "Balance " + balanceId + "Not Found!"
                });
            }

            return resolve({
                err: false,
                balances: balanceTable
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }

    })
}