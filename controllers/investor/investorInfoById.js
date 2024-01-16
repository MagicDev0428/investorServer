//
//  investor info by id 
//

import {
    Models
} from "../../models";

import {
    Lib
} from "../../utils";


// creating investor table model
let investorTable = Models.Investor;

const investorIdAggregation = () => {
    const currentDate = new Date();
    return [{
            $lookup: {
                from: "myInvestments",
                let: {
                    investor: "$_id"
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$investorName", "$$investor"]
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            firstInvestment: {
                                $min: '$transferDate'
                            },
                            totalMonthlyProfit: {
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
                                        then: "$profitMonthly",
                                        else: 0
                                    }
                                }
                            },
                             
                        },
                    },
                ],
                as: "accountInvestments",
            },
        },
        {
            $unwind: {
                path: "$accountInvestments",
                preserveNullAndEmptyArrays: true,
            },
        },
         {
            $addFields: {
                "accountInvestments.investForMonths": {
                    $divide: [{
                            $subtract: [
                                currentDate,
                                "$accountInvestments.firstInvestment"
                            ]
                        },
                        2629746000 // milliseconds in a month
                    ]
                }
            }
        },
        {
            $lookup: {
                from: "myInvestments",
                pipeline: [{
                    $group: {
                        _id: null,
                        totalInvestments: {
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
                }],
                as: "totalAmountInvested",
            }
        },
        {
            $unwind: {
                path: "$totalAmountInvested",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "balance",
                let: {
                    investor: "$_id"
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$investorName", "$$investor"]
                            },

                        },
                    },

                    {
                        $group: {
                            _id: null,
                            totalDeposit: {
                                $sum: {
                                    $cond: {
                                        if: {
                                            $or: [{
                                                    profitMonthPaid: true
                                                },
                                                {
                                                    profitOtherPaid: true
                                                }
                                            ]
                                        },
                                        then: "$deposit",
                                        else: 0
                                    }
                                }
                            },



                        },
                    },
                ],
                as: "accountBalancesTotalDeposit",
            },
        },
        {
            $unwind: {
                path: "$accountBalancesTotalDeposit",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "balance",
                let: {
                    investor: "$_id"
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$investorName", "$$investor"]
                            },

                        },
                    },
                    {
                        $sort: {
                            transferDate: -1
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $group: {
                            _id: null,
                            latestBalance: {
                                $push: "$$ROOT"
                            }

                        },
                    },
                ],
                as: "latestAccountBalances",
            },
        },
        {
            $unwind: {
                path: "$latestAccountBalances",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                investor: "$$ROOT",
            },
        },
    ]
}

export const investorInfoById = (id) => {
    global.show("###### investorInfo ######");


    return new Promise(async (resolve, reject) => {
        try {

            if (!id) {
                return reject({
                    err: true,
                    message: "Didn't get investor id in params"
                });
            }

            // Check if the _id exists
            const existingInvestor = await Models.Investor.findById(id);

            if (!existingInvestor) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Your Investor Id does not exist!"
                });
            }

            // pipeline setup for aggregation
            const pipeline = [{
                    $match: {
                        _id: id
                    }
                },
                ...investorIdAggregation(), // Include common stages
            ];
            investorTable = null;
            investorTable = await Models.Investor.aggregate(pipeline);
            // checking if investor data exist then resolve the promise otherwise reject it
            if (investorTable) {


                return resolve({
                    status: 200,
                    err: false,
                    investors: investorTable
                });

            }


            return reject({
                status: 404,
                err: true,
                message: "Unable to get investor info!"
            });
        } catch (error) {
            return reject({
                status: 500,
                err: true,
                message: error.message
            })
        }

    })
}