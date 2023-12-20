//
// Get  Investment
//

import {
    Models
} from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel

const aggregateStages = [

    {
        $lookup: {
            from: "myInvestments",
            let: {
                investment: "$_id"
            },
            pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$investmentNo", "$$investment"]
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        sumOfTotalAmountInvested: {
                            $sum: "$amountInvested"
                        },

                        myInvestmentsList: {
                            $push: "$$ROOT"
                        },
                    },
                },
            ],
            as: "myInvestmentsList",
        },
    },
    {
        $unwind: {
            path: "$myInvestmentsList",
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $addFields: {
            investmentMissing: {
                $subtract: [{
                        $ifNull: ["$investAmount", 0]
                    },
                    {
                        $ifNull: ["$myInvestmentsList.sumOfTotalAmountInvested", 0]
                    }
                ]
            }
        }
    },
    {
        $addFields: {
            remainingDays: {
                $ifNull: [{
                        $divide: [{
                                $subtract: [{
                                        $ifNull: [{
                                            $toDate: "$endDate"
                                        }, new Date(0)]
                                    },
                                    {
                                        $ifNull: [{
                                            $toDate: "$startDate"
                                        }, new Date(0)]
                                    },
                                ],
                            },
                            1000 * 60 * 60 * 24, // Convert milliseconds to days
                        ],
                    },
                    0 // Default value if the result is null
                ]
            },
        }
    },
    {
        $lookup: {
            from: "adam",
            let: {
                investment: "$_id"
            },
            pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$investmentNo", "$$investment"]
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        sumOfTotalAmountAdam: {
                            $sum: "$amount" // sum of all amount of adam
                        },
                        adams: {
                            $push: "$$ROOT"
                        },
                    },
                },
            ],
            as: "adams",
        },
    },
    {
        $unwind: {
            path: "$adams",
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $lookup: {
            from: "log",
            let: {
                investment: "$_id"
            },
            pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$investmentNo", "$$investment"]
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        logs: {
                            $push: "$$ROOT"
                        },
                    },
                },
            ],
            as: "logs",
        },
    },
    {
        $unwind: {
            path: "$logs",
            preserveNullAndEmptyArrays: true,
        },
    },


    {
        $project: {
            investments: "$$ROOT",
        },
    },


];




// Get all data used on the investment form



export const investmentInfo = (investmentId) => {

    global.show("###### investmentInfo ######")
    if (investmentId) global.show(investmentId);

    // Input from recieved:
    // - recieved._id (the investments unique key of investments collection)

    return new Promise(async (resolve, reject) => {

        try {
            // Check for investmentId data
            if (!investmentId) {
                return reject({
                    err: true,
                    message: "Nothing investmentId from caller"
                })
            }

            // investment ID missing (_id)
            if (!investmentId) {
                return reject({
                    err: true,
                    message: `investment id ${investmentId} is not missing!`
                })
            }

            // check recieved._id exists
            const investmentExists = await Models.investmentModel.exists({
                _id: investmentId,
            });

            if (!investmentExists) {
                return reject({
                    err: true,
                    message: `investment id ${investmentId} is not exist!`,
                });
            }


            // pipeline setup for aggregation
            const pipeline = [{
                    $match: {
                        _id: Number(investmentId)
                    }
                },

                ...aggregateStages, // Include aggregate stages
            ];



            investmentTable = null;
            // investmentTable = await aggregateInvestmentData(pipeline); 
            investmentTable = await Models.investmentModel.aggregate(pipeline);

            return resolve({
                err: false,
                investmentInfo: investmentTable
            })

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });

}