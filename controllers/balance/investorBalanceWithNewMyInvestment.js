import {
    Models
} from "../../models";
import { Lib } from '../../utils';
// creating balance table model
let balanceTable = Models.balanceModel;

const addingThaiBalances = async (response) => {
 
    let balanceInThai = 0;

    function sortByDateAscending(a, b) {
        const dateA = new Date(a.startDate || a.profitMonth);
        const dateB = new Date(b.startDate || b.profitMonth);

        return dateA - dateB;
    }
    let sortedArrayResult  = await response.balancesAndMyInvestments.sort(sortByDateAscending);
    //  let sortedArrayResult = await response[0].investor.accountBalances.investorBalanceList.sort(sortByDateAscending);
    await sortedArrayResult.forEach((value) => {
        if (value.deposit > 0) {
            balanceInThai += value.deposit
            value.balanceInThai = balanceInThai
        } else if (value.withdraw < 0) {
            balanceInThai += value.withdraw
            value.balanceInThai = balanceInThai
        } else {
            value.balanceInThai = balanceInThai
        }

    })
    return response
}


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
                                                { $gte: ["$transferDate", firstDayOfMonth] },
                                                { $lt: ["$transferDate", lastDayOfMonth] }
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




export const investorBalanceListWithNewInvestment = (investorId) => {
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


            

             const response_= await Models.balanceModel.aggregate(pipeline);

            balanceTable = null;
            let  formatedBalanceRecords_ = await Lib.changeIntoFormat(response_)
           
            balanceTable = await addingThaiBalances(formatedBalanceRecords_)
            if (!balanceTable) {
                return reject({
                    err: true,
                    message: "Didn't get investor balance data"
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