import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;

const changeIntoFormat = (response)=>{
    // Merge investorBalanceLists and newMyInvestments into one array
const balancesAndMyInvestments = response.reduce((acc, item) => {
  if (item.investorBalanceLists) {
    acc.push(...item.investorBalanceLists);
  } else if (item.newMyInvestments) {
    acc.push(...item.newMyInvestments);
  }
  return acc;
}, []);

balancesAndMyInvestments.sort((a, b) => {
  const dateA = a.profitMonth || a.startDate;
  const dateB = b.profitMonth || b.startDate;
  return new Date(dateA) - new Date(dateB);
});
// Extract totalMonthlyProfit and totalDeposit from the original response
const totalMonthlyProfit = response.reduce((acc, item) => (item.totalMonthlyProfit !== undefined ? item.totalMonthlyProfit : acc), undefined);
const totalDeposit = response.reduce((acc, item) => (item.totalDeposit !== undefined ? item.totalDeposit : acc), undefined);

// Create a single object with the merged array, totalMonthlyProfit, and totalDeposit
return {
    totalMonthlyProfit,
    totalDeposit,
    balancesAndMyInvestments,
};

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
            balanceTable = changeIntoFormat(response_)
           

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