import {
    Models
} from "../../models";


// creating investor table model
let investorTable = Models.Investor;


const investorPortfolioAggregate = () => {
    // Common stages for the aggregation pipeline

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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
                            allInvestments: {
                                $sum: {
                                    $ifNull: ["$amountInvested", 0]
                                }
                            },
                            totalProfitMonthly: {
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
                            totalProfitEnd: {
                                $sum: {
                                    $ifNull: ["$profitEnd", 0]
                                }
                            },
                            newMyInvestments: {
                                $push: {
                                    $cond: [{
                                            $and: [{
                                                    $gte: ["$startDate", firstDayOfMonth]
                                                },
                                                {
                                                    $lt: ["$startDate", lastDayOfMonth]
                                                }
                                            ]
                                        },
                                        "$$ROOT",
                                        null
                                    ]
                                }
                            },
                            myInvestmentList: {
                                $push: "$$ROOT"
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
                "accountInvestments.newMyInvestments": {
                    $filter: {
                        input: "$accountInvestments.newMyInvestments",
                        as: "investment",
                        cond: {
                            $ne: ["$$investment", null]
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                            "accountInvestments.newMyInvestments": {
                                $map: {
                                    input: "$accountInvestments.newMyInvestments",
                                    as: "investment",
                                    in: { $mergeObjects: ["$$investment", { newInvestment: true }] }
                                }
                            }
                        }
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
                            "profitMonth": -1
                        } // Sorting in ascending order, adjust as needed
                    },
                    {
                        $group: {
                            _id: null,
                            totalProfitPaid: {
                                $sum: "$deposit"
                            },
                            totalWithdraw: {
                                $sum: "$withdraw"
                            },
                            total_balance: {
                                $sum: {
                                    $subtract: [{
                                            $sum: "$deposit"
                                        },
                                        {
                                            $sum: "$withdraw"
                                        }
                                    ],
                                },
                            },
                            investorBalanceList: {
                                $push: "$$ROOT"
                            }
                        },
                    },
                ],
                as: "accountBalances",
            },
        },
        {
            $unwind: {
                path: "$accountBalances",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                newestBalance: {
                    $arrayElemAt: ["$accountBalances.investorBalanceList", 0],
                },
                accountBalances: {
                    $mergeObjects: [
                        "$accountBalances",
                        {
                            investorBalanceList: {
                                $concatArrays: [{
                                        $ifNull: ["$accountInvestments.newMyInvestments", []]
                                    },
                                    {
                                        $ifNull: ["$accountBalances.investorBalanceList", []]
                                    },
                                ],
                            },
                        },
                    ],
                },
                profitInPercentage: {
                    $multiply: [{
                            $cond: [{
                                    $eq: ["$accountInvestments.allInvestments", 0]
                                },
                                0, // Avoid division by zero
                                {
                                    $multiply: [{
                                            $divide: ["$accountBalances.totalProfitPaid", "$accountInvestments.allInvestments"]
                                        },
                                        100
                                    ]
                                }
                            ]
                        },
                        1 // Convert the result to a number (optional)
                    ]
                },
            },
        },



        {
            $project: {
                _id: 0,
                investor: "$$ROOT",
            },
        },


    ];
};



const addingThaiBalances = async (response) => {
    let balanceInThai = 0;

    function sortByDateAscending(a, b) {
        const dateA = new Date(a.startDate || a.profitMonth);
        const dateB = new Date(b.startDate || b.profitMonth);

        return dateA - dateB;
    }
    let sortedArrayResult = await response[0].investor.accountBalances.investorBalanceList.sort(sortByDateAscending);
    await sortedArrayResult.forEach((value) => {
        if (value.deposit > 0) {
            balanceInThai += value.deposit
            value.balanceInThai = balanceInThai
        } else if (value.withdraw > 0) {
            balanceInThai -= value.withdraw
            value.balanceInThai = balanceInThai
        } else {
            value.balanceInThai = balanceInThai
        }

    })

    return response
}

export const investorPortfolio = (id) => {
    global.show("###### Investor Portfolio ######")

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
                ...investorPortfolioAggregate(), // Include common stages
            ];
            investorTable = null;
            const response_ = await Models.Investor.aggregate(pipeline);

            investorTable = await addingThaiBalances(response_)
            if (investorTable) {
                return resolve({
                    err: false,
                    investors: investorTable
                });
            }
            return reject({
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