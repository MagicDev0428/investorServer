//
//  info and list of all investors
//

const mongoose = require("mongoose");
const { investorModel } = require("../../models/investor/investorModel");
const { investorSchema } = require("../../schema/investor/investorSchema");

// Creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

// Common function for the aggregation pipeline
const aggregateInvestorData = async (pipeline) => {
  return await investorModel.aggregate(pipeline);
};

// Common stages for the aggregation pipeline
const commonStages = [
  {
    $group: {
      _id: "$_id",
      Status: { $first: "$status" },
      Country: { $first: "$country" },
    },
  },
  {
    $lookup: {
      from: "balances", // balances collection
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
          },
        },
      ],
      as: "accountBalances",
    },
  },
  {
    $unwind: {
      path: "$accountBalances", // account Balances collection
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
      _id: 1,
      Status: 1,
      Country: 1,
      Total_Deposit: { $ifNull: ["$accountBalances.totalDeposit", null] },
      Total_Withdraw: { $ifNull: ["$accountBalances.totalWithdraw", null] },
      Total_Balance: {
        $subtract: [
          { $ifNull: ["$accountBalances.totalDeposit", 0] },
          { $ifNull: ["$accountBalances.totalWithdraw", 0] },
        ],
      },
      Amount_Invested: {
        $ifNull: ["$accountInvestments.totalInvested", null],
      },
      Profit_PrMonth: {
        $ifNull: ["$accountInvestments.totalProfitPrMonth", null],
      },
    },
  },
];

exports.investorInfo = async (id) => {
  global.show("###### investorInfo ######");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id in params" });
    }

    // Check if the _id exists
    const existingInvestor = await investorModel.findById(id);

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
    if (investorTable) return resolve({ err: false, investors: investorTable });
    return reject({ err: true, message: "Unable to get investor info!" });
  });
};

exports.investorList = async () => {
  global.show("###### investorList ######");

  return new Promise(async (resolve, reject) => {
    //pipeline setup for aggregation
    const pipeline = [
      ...commonStages, // Include common stages
    ];

    investorTable = null;
    investorTable = await aggregateInvestorData(pipeline); // calling aggregation function for investor list

    // checking if investor data exist then resolve the promise otherwise reject it
    if (investorTable) return resolve({ err: false, investors: investorTable });
    return reject({ err: true, message: "Unable to get investor list!" });
  });
};
