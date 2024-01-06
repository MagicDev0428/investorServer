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


// Inserting button color

const insertingButtonColor = async (data) => {
// 	data = await data.filter((investorInfo) => {
//     const accountBalances = investorInfo.investor.accountBalances;
//     const currentMonthBalanceList = accountBalances ? accountBalances.currentMonthBalanceList : null;
//     const previousMonthBalanceList = accountBalances ? accountBalances.previousUnpaidBalanceList : null;

//     return (currentMonthBalanceList && currentMonthBalanceList.length > 0) || 
//            (previousMonthBalanceList && previousMonthBalanceList.length > 0);
// });

  for (const investorInfo of data) {
    if (investorInfo.investor.accountBalances?.currentMonthBalanceList) {
      investorInfo.investor.accountBalances.currentMonthBalanceList = await Lib.removeNullValuesFromArray(
        investorInfo.investor.accountBalances.currentMonthBalanceList
      );
      investorInfo.investor.accountBalances.previousUnpaidBalanceList = await Lib.removeNullValuesFromArray(
        investorInfo.investor.accountBalances.previousUnpaidBalanceList
      );

     
      const totalInvestment = investorInfo.investor.totalInvestment;
      const { totalDeposit, emailDateStatus, isBefore15th } = Lib.sumDepositAndEmailStatus(
        investorInfo.investor.accountBalances?.currentMonthBalanceList
      );

    
      if (investorInfo.investor.getInvestmentType == false) {
       
			let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor= "Purple",
			accountBalances.nextMonth=investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
       
      } else if (isBefore15th && investorInfo.investor.accountBalances.currentMonthBalanceList) {
      
			let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor = "Green",
			accountBalances.nextMonth = investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
        
      } else {
        if (
          totalInvestment <= totalDeposit &&
          emailDateStatus &&
          investorInfo.investor.accountBalances.currentMonthBalanceList
        ) {
			let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor = "Green",
			accountBalances.nextMonth = investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
        
        } else if (
          totalInvestment <= totalDeposit &&
          !emailDateStatus &&
          investorInfo.investor.accountBalances.currentMonthBalanceList
        ) {
			let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor = "Yellow",
			accountBalances.nextMonth = investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
        
        } else if (
          totalDeposit <= totalInvestment &&
          !emailDateStatus &&
          investorInfo.investor.accountBalances.currentMonthBalanceList
        ) {
          const remainingAmount = totalInvestment - totalDeposit;
		  let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor = "Red",
			accountBalances.nextMonth = investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
      
        } else if (
          totalDeposit == 0 &&
          !emailDateStatus &&
          investorInfo.investor.accountBalances.currentMonthBalanceList
        ) {
          const remainingAmount = totalInvestment - totalDeposit;
		  let accountBalances = investorInfo.investor.accountBalances
            accountBalances.currentMonthDeposit = totalDeposit,
            accountBalances.buttonColor = "Red",
			accountBalances.nextMonth = investorInfo.investor.accountBalances.currentMonthBalanceList[0].profitMonth
      
        }
      }
    
    }
  }

  return data;
};

// Common stages for the aggregation pipeline
const commonStages = () => {
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
								// $sum: {
								// 	$ifNull: ["$profitMonthly", 0]
								// }
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




exports.investorInfo = async (id) => {
	global.show("###### investorInfo ######");
	// const received = req ? req.body : null;
	// if (received) global.show({ received });


	return new Promise(async (resolve, reject) => {
		try {
			// const id = received._id
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
				...commonStages(), // Include common stages
			];


			const investorAggegation = await aggregateInvestorData(pipeline); // calling  aggregation function for investor info
			// checking if investor data exist then resolve the promise otherwise reject it
			if (investorAggegation) {

				const insertInvestmenttype = await Lib.returnTheInvestmentType(investorAggegation)

				investorTable = null;
				// calling a inserting button color which will insert color and return it
				investorTable = await insertingButtonColor(insertInvestmenttype);

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
				err: true,
				message: error.message
			})
		}
	});
};



exports.investorList = async () => {
	global.show("###### investorList ######");

	return new Promise(async (resolve, reject) => {

		try {
			//pipeline setup for aggregation
			const pipeline = [
				...commonStages(), // Include common stages
			];

			const investorAggegation = await aggregateInvestorData(pipeline); // calling  aggregation function for investor info
			// checking if investor data exist then resolve the promise otherwise reject it
			if (investorAggegation) {

				const insertInestmenttype = await Lib.returnTheInvestmentType(investorAggegation)

				investorTable = null;
				// calling a inserting button color which will insert color and return it
				investorTable = await insertingButtonColor(insertInestmenttype);


				return resolve({
					err: false,
					investors: investorTable
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