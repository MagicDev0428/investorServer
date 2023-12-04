const mongoose = require("mongoose");
const { investorModel } = require("../../models/investor/investorModel");
const { investorSchema } = require("../../schema/investor/investorSchema");

// creating investor table model
let investorTable = mongoose.model("investor", investorSchema);

//
// List all the investors with their balance and investment amounts
//

//
// URL +> http://localhost:3007/investor/investorinfo/id
//
// replace id with investor id to get his/her information
//

exports.investorInfo = (id) => {
  global.show("###### investorInfo ######");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor idin params" });
    }

    // Check if the _id exists
    const existingInvestor = await investorModel.findById(id);

    if (!existingInvestor) {
      return reject({
        err: true,
        message: "Your Investor Id does not exist! ",
      });
    }

    investorTable = null;
    investorTable = await investorModel.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      {
        $group: {
          _id: "$_id",
          Status: { $first: "$status" },
          Country: { $first: "$country" },
        },
      },
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
              },
            },
          ],
          as: "accountBalances",
        },
      },
      {
        $unwind: {
          path: "$accountBalances",
          preserveNullAndEmptyArrays: true, // Handle the case where there's no match in accountbalances
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
          preserveNullAndEmptyArrays: true, // Handle the case where there's no match in investments
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
    ]);

    return resolve({ err: false, investors: investorTable });
  });
};
