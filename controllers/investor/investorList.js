//
//  info and list of all investors
//

import {
    Models
} from "../../models";

import {
    Lib
} from "../../utils";
// creating investor table model
let investorTable = Models.Investor;

// Common function for the aggregation pipeline
const aggregateInvestorData = async (pipeline) => {
    return await Models.Investor.aggregate(pipeline);
};




const frontPageFunctionality = (data) => {
    let investorsLeftToPay = 0
    let profitLeftToPay = 0
    let profitAlreadyPaid = 0
    let profitToPay = 0
    // data = data.filter((investorInfo) => {
    //     const accountBalances = investorInfo.investor.accountBalances;
    //     const balanceList = accountBalances ? accountBalances.balanceList : null;

    //     return balanceList && balanceList.length > 0;
    // });
    data.forEach((investorInfo) => {

        const accountBalances = investorInfo.investor.accountBalances;
        const balanceList = accountBalances ? accountBalances.balanceList : null;
        const totalInvestment = investorInfo.investor.totalInvestment
        // const investmentType = investorInfo.investor.getInvestmentType

        // adding every investor total monthly profit into profit to pay
        profitToPay += investorInfo.investor.totalMonthlyProfit;
        // if (investmentType === 'High' && balanceList) {
        // 	investorInfo.investor.buttonColor = 'PURPLE'
        // } else 

        if (balanceList) {

            const {
                totalDeposit,
                emailDateStatus,
                isBefore15th
            } = Lib.sumDepositAndEmailStatus(balanceList);

            // Conditions for current month
            if (investorInfo.investor.getInvestmentType == false) {
                investorInfo.investor.accountBalances.currentMonthBalanceList.unshift({
                    balanceInfo: {
                        currentMonthDeposit: totalDeposit,
                        buttonColor: "Purple",
                    },
                });
            } else if (isBefore15th) {

                investorInfo.investor.buttonColor = 'GREEN';

                profitAlreadyPaid += totalDeposit
                const remainingAmount = totalInvestment - totalDeposit
                profitLeftToPay += remainingAmount
                investorsLeftToPay += totalInvestment
                // profitAlreadyPaid += totalDeposit

            } else if ((totalDeposit >= totalInvestment && emailDateStatus)) {

                // total deposit of green adding in profit Already paid
                profitAlreadyPaid += totalDeposit
                investorInfo.investor.buttonColor = 'GREEN'
            } else if (totalDeposit >= totalInvestment && !emailDateStatus) {

                // total deposit of yellow adding in profit Already paid
                profitAlreadyPaid += totalDeposit
                investorInfo.investor.buttonColor = 'YELLOW'
            } else if (totalDeposit <= totalInvestment && !emailDateStatus) {

                // total my investment - total Deposit and then add in profitLeftToPay
                const remainingAmount = totalInvestment - totalDeposit
                profitLeftToPay += remainingAmount
                investorInfo.investor.buttonColor = 'RED'
            } else if (totalDeposit == 0 && !emailDateStatus) {

                // adding all my investment amount in investorLeftToPay
                investorsLeftToPay += totalInvestment
                investorInfo.investor.buttonColor = 'RED'
            }


        }

    });

  
    return {
        investors: data,
        investorProfitResult: {
            investorsLeftToPay,
            profitLeftToPay,
            profitAlreadyPaid,
            profitToPay
        }
    };
}

// Common stages for the aggregation pipeline
const commonStages = (date_) => {
    const today = new Date();
    return [

        {
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
                            totalInvested: {
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
                totalInvestment: "$accountInvestments.totalInvested",
                totalMonthlyProfit: "$accountInvestments.totalProfitMonthly",
                totalProfitEnd: "$accountInvestments.totalProfitEnd",
                totalProfit: {
                    $add: ["$accountInvestments.totalInvested", "$accountInvestments.totalProfitMonthly", "$accountInvestments.totalProfitEnd"],
                },
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
                                $and: [{
                                        $eq: ["$investorName", "$$investor"]
                                    },
                                    {
                                        $eq: [{
                                                $dateToString: {
                                                    format: "%Y-%m",
                                                    date: "$profitMonth",
                                                },
                                            },
                                            date_, // Replace with the desired month and year
                                        ],
                                    }
                                ]
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalDeposit: {
                                $sum: "$deposit"
                            },
                            totalWithdraw: {
                                $sum: "$withdraw"
                            },
                            total_balance: {
                                $sum: {
                                    $subtract: [{
                                        $sum: "$deposit"
                                    }, {
                                        $sum: "$withdraw"
                                    }],
                                },
                            },
                            balanceList: {
                                $push: "$$ROOT"
                            },
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
            $project: {
                investor: "$$ROOT",
            },
        },
    ];
}


// investment aggregate function 
const investmentAggregate = async () => {
    // this today will use to get the count of active investment and sum of active investment amount  
    const today = new Date();
    const investmentResult = await Models.investmentModel.aggregate([{
            $group: {
                _id: null,
                totalInvestmentAmount: {
                    $sum: "$investAmount"
                },
                amountAvailable: {
                    $sum: {
                        $cond: [{
                                $and: [{
                                        $lte: ["$startDate", today]
                                    },
                                    {
                                        $gte: ["$endDate", today]
                                    }
                                ]
                            },
                            "$investAmount",
                            0
                        ]
                    }
                },
                openInvestments: {
                    $sum: {
                        $cond: [{
                                $and: [{
                                        $lte: ["$startDate", today]
                                    },
                                    {
                                        $gte: ["$endDate", today]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                investments: {
                    $push: '$$ROOT'
                },
            }
        },
        {
            $project: {
                _id: 0,
                totalInvestmentAmount: 1,
                amountAvailable: 1,
                openInvestments: 1,
                filteredInvestments: {
                    $filter: {
                        input: {
                            $map: {
                                input: '$investments',
                                as: 'investment',
                                in: {
                                    investment: '$$investment',
                                    remainingDays: {
                                        $floor: {
                                            $divide: [{
                                                    $subtract: ['$$investment.endDate', today]
                                                },
                                                24 * 60 * 60 * 1000,
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                        as: 'item',
                        cond: {
                            $and: [{
                                    $lte: ['$$item.remainingDays', 60]
                                },
                                {
                                    $ne: ['$$item.remainingDays', null]
                                },
                                {
                                    $gt: ['$$item.remainingDays', 0]
                                },
                            ],
                        },
                    },
                },
            },
        },
        {
            $lookup: {
                from: "investor",
                pipeline: [{
                        $match: {
                            status: "INVESTOR"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalInvestors: {
                                $sum: 1
                            }
                        }
                    }
                ],
                as: "investor"
            }
        },
        {
            $lookup: {
                from: "balance",
                pipeline: [{
                        $match: {
                            $or: [{
                                    profitMonthPaid: true
                                },
                                {
                                    profitOtherPaid: true
                                }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalProfitPaid: {
                                $sum: {
                                    $ifNull: ["$deposit", 0]
                                }
                            }
                        }
                    }
                ],
                as: "balance"
            }
        },
        {
            $lookup: {
                from: "log",
                let: {},
                pipeline: [{
                        $sort: {
                            id: -1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            logRecords: {
                                $push: "$$ROOT"
                            }
                        }
                    },
                    {
                        $project: {
                            logRecords: {
                                $slice: ["$logRecords", 15]
                            }
                        }
                    }
                ],
                as: "log"
            }
        },
        {
            $project: {
                totalInvestmentAmount: 1,
                amountAvailable: 1,
                openInvestments: 1,
                filteredInvestments: 1,
                totalInvestors: {
                    $arrayElemAt: ["$investor.totalInvestors", 0]
                },
                totalProfitPaid: {
                    $arrayElemAt: ["$balance.totalProfitPaid", 0]
                },
                logRecords: {
                    $arrayElemAt: ["$log.logRecords", 0]
                }
            }
        }
    ]);

    return investmentResult[0]; // Assuming there is only one result document
}




// investor information using date 
export const investorInfoForDate = async (req) => {
    global.show("###### investorInfo by date ######");
    const received = req ? req.body : null;
    if (received) global.show({
        received
    });


    return new Promise(async (resolve, reject) => {
        try {
            const id = received._id
            // Check for id
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
                ...commonStages(received.date), // Include common stages
            ];


            const aggregateResult = await aggregateInvestorData(pipeline); // calling  aggregation function for investor info

            // calling investment aggreagate which will return the information of investment,myInvestment and balance 
            const investmentResult = await investmentAggregate()

            // checking if investor data exist then resolve the promise otherwise reject it
            if (aggregateResult && investmentResult) {

                const insertInvestmenttype = await Lib.returnTheInvestmentType(aggregateResult)

                investorTable = null;
                // calling a inserting button color which will insert color and return it
                investorTable = await frontPageFunctionality(insertInvestmenttype);

                // adding investment result 
                investorTable.investmentAndLogs = investmentResult

                return resolve({
                    err: false,
                    result: investorTable
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
};


// investor List using date 
export const investorListForDate = async (req) => {
    global.show("###### investorList ######");
    const received = req ? req.body : null;

    return new Promise(async (resolve, reject) => {

        try {


            //pipeline setup for aggregation
            const pipeline = [
                ...commonStages(received.date), // Include common stages
            ];

            const aggregateResult = await aggregateInvestorData(pipeline); // calling aggregation function for investor list

            // calling investment aggreagate which will return the information of investment,myInvestment and balance 
            const investmentResult = await investmentAggregate()

            // checking if investor data exist then resolve the promise otherwise reject it
            if (aggregateResult && investmentResult) {

                const insertInvestmenttype = await Lib.returnTheInvestmentType(aggregateResult)

                investorTable = null;
                // calling a inserting button color which will insert color and return it
                investorTable = await frontPageFunctionality(insertInvestmenttype);


                investorTable.investmentAndLogs = investmentResult

                return resolve({
                    err: false,
                    result: investorTable
                });
            }
            return reject({
                err: true,
                message: "Unable to get investor list!"
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};