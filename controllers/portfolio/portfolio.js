import {
    Models
} from "../../models";

import {
    Lib
} from "../../utils";

// creating investor table model
let investorTable = Models.Investor;

const investorPortfolioAggregate = () => {
// Common stages for the aggregation pipeline

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
								$eq: ["$investorName", "$$investor"]
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
							currentMonthBalanceList: {
								$push: {
									$cond: {
										if: {
											$and: [{
													$ne: ["$profitMonth", null]
												},
												{

													$eq: [{
															$dateToString: {
																date: "$profitMonth",
																format: "%Y-%m",
															},
														},
														new Date().toISOString().substr(0, 7),
													],
												},
											],
										},
										then: "$$ROOT",
										else: null,
									},
								},
							},
							previousUnpaidBalanceList: {
								$push: {
									$cond: {
										if: {
											$and: [{
													$ne: [{
															$dateToString: {
																date: "$profitMonth",
																format: "%Y-%m",
															},
														},
														new Date().toISOString().substr(0, 7),
													]
												},
												{

													$ne: [
														"$profitMonthPaid", true

													],
												},
											],
										},
										then: {
											$mergeObjects: ["$$ROOT", {
												buttonColor: "Red"
											}],
										},
										else: null,
									},
								},
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



export const investorPortfolio = (id)=>{
    global.show("###### investor portfolio ######");


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

            investorTable = null 
            investorTable = await Models.Investor.aggregate(pipeline);
            if(investorTable){
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