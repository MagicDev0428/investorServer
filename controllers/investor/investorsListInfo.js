//
//  info and list of all investors
//

const mongoose = require("mongoose");
const { Investor: investorModel } = require("../../models/investorModel");
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
