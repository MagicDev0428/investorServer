import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;



// const investorBalance = (investorId) => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//     return [
//         {
//             $sort: {
//                 "profitMonth": 1
//             }
//         },
//         {
//             $group: {
//                 _id: null,
//                 totalDeposit: {
//                     $sum: '$deposit'
//                 },
//                 investorBalanceLists: {
//                     $push: "$$ROOT"
//                 }
//             }
//         },
//         {
//             $unionWith: {
//                 coll: "myInvestments",
//                 pipeline: [
//                     {
//                         $match: {
//                             investorName: investorId
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: null,
//                             totalMonthlyProfit: {
//                                 $sum: {
//                                     $cond: [
//                                         {
//                                             $and: [
//                                                 { $lte: ["$firstProfitDate", today] },
//                                                 { $gte: ["$lastProfitDate", today] }
//                                             ]
//                                         },
//                                         "$profitMonthly",
//                                         0
//                                     ]
//                                 }
//                             },
//                             newMyInvestments: {
//                                 $push:
//                                 {
//                                     $cond: [
//                                         {
//                                             $and: [
//                                                 { $gte: ["$startDate", firstDayOfMonth] },
//                                                 { $lt: ["$startDate", lastDayOfMonth] }
//                                             ]
//                                         },
//                                         // "$$ROOT",
//                                         ,
//                                         {
//                                             $mergeObjects: ["$$ROOT", { newInvestment: true }]
//                                         },
//                                         null
//                                     ]
//                                 }
//                             }
//                         }
//                     },
//                     {
//                         $project: {
//                             newMyInvestments: {
//                                 $filter: {
//                                     input: "$newMyInvestments",
//                                     as: "investment",
//                                     cond: { $ne: ["$$investment", null] }
//                                 }
//                             },
//                             totalMonthlyProfit: 1
//                         }
//                     }
//                 ]
//             }
//         },
//     ];
// };
const investorBalance = (investorId) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return [
        {
            $sort: {
                "profitMonth": 1
            }
        },
        {
            $group: {
                _id: null,
                totalDeposit: {
                    $sum: '$deposit'
                },
                investorBalanceLists: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $unionWith: {
                coll: "myInvestments",
                pipeline: [
                    {
                        $match: {
                            investorName: investorId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalMonthlyProfit: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $lte: ["$firstProfitDate", today] },
                                                { $gte: ["$lastProfitDate", today] }
                                            ]
                                        },
                                        "$profitMonthly",
                                        0
                                    ]
                                }
                            },
                            newMyInvestments: {
                                $push: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $gte: ["$startDate", firstDayOfMonth] },
                                                { $lt: ["$startDate", lastDayOfMonth] }
                                            ]
                                        },
                                        "$$ROOT",
                                        null
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            newMyInvestments: {
                                $filter: {
                                    input: "$newMyInvestments",
                                    as: "investment",
                                    cond: { $ne: ["$$investment", null] }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            newMyInvestments: {
                                $map: {
                                    input: "$newMyInvestments",
                                    as: "investment",
                                    in: { $mergeObjects: ["$$investment", { newInvestment: true }] }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            newMyInvestments: 1,
                            totalMonthlyProfit: 1
                        }
                    }
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
                    message: "Didn't ger investor balance data"
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