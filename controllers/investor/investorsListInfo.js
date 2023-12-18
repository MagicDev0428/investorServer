//
//  info and list of all investors
//

import { Models } from "../../models"; 
// creating investor table model
let investorTable = Models.Investor;


// Common function for the aggregation pipeline
const aggregateInvestorData = async (pipeline) => {
  return await Models.Investor.aggregate(pipeline);
};

// Common stages for the aggregation pipeline
const commonStages = [
  {
    $lookup: {
      from: "balances",
      let: { investor: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$investorName", "$$investor"] },
          },
        },
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: "$deposit" },
            totalWithdraw: { $sum: "$withdraw" },
            total_balance: {
              $sum: {
                $subtract: [{ $sum: "$deposit" }, { $sum: "$withdraw" }],
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
    $lookup: {
      from: "myinvestments",
      let: { investor: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$investorName", "$$investor"] },
          },
        },
        {
          $group: {
            _id: null,
            totalInvested: { $sum: "$amountInvested" },
            totalProfitPrMonth: { $sum: "$profitPrMonth" },
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
    $project: {
      investor: "$$ROOT",
    },
  },
];



exports.investorInfo = async (id) => {
  global.show("###### investorInfo ######");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    try{
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id in params" });
    }

    // Check if the _id exists
    const existingInvestor = await Models.Investor.findById(id);

    if (!existingInvestor) {
      return reject({ err: true, message: "Your Investor Id does not exist!" });
    }

    // pipeline setup for aggregation
    const pipeline = [
      { $match: { _id: id } },
      ...commonStages, // Include common stages
    ];

    investorTable = null;
    investorTable = await aggregateInvestorData(pipeline); // calling  aggregation function for investor info

    // checking if investor data exist then resolve the promise otherwise reject it
    if (investorTable) {return resolve({ err: false, investors: investorTable });}
    return reject({ err: true, message: "Unable to get investor info!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

exports.investorList = async () => {
  global.show("###### investorList ######");

  return new Promise(async (resolve, reject) => {

    try{
    //pipeline setup for aggregation
    const pipeline = [
      ...commonStages, // Include common stages
    ];

    investorTable = null;
    investorTable = await aggregateInvestorData(pipeline); // calling aggregation function for investor list

    // checking if investor data exist then resolve the promise otherwise reject it
    if (investorTable) {return resolve({ err: false, investors: investorTable });}
    return reject({ err: true, message: "Unable to get investor list!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
