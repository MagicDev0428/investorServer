const mongoose = require("mongoose");

module.exports.myInvestmentsSchema = new mongoose.Schema(
  {
    _id: Number, // MyInvestment unique number

    investmentNo: Number, // Investment Number from Investment Table
    investorName: { type: String, required: true }, // Name from Investors Table

    amountInvested: Number, // The amount of money invested
    transferDate: Number, // Date of the transfer

    transactionFrom: String, // Transfer transaction FROM bank / account
    transactionTo: String, // Transfer transaction TO bank / account
    transactionNo: String, // Transaction number from bank
    documents: Array, // Array of Images and reciepts ("filename","filename")

    profitMonthly: Number, // Monthly Profit Procentage
    profitYearly: Number, // Yearly Profit Procentage
    profitEnd: Number, // When investment ends Profit Procentage

    investType: String, // InvestmentType: Monthly Profit, Annual Profit, One-time Profit, Mixed
    firstProfitDate: Number, // When will we PAY the first PROFIT to the investor
    lastProfitDate: Number, // When will we PAY the last PROFIT to the investor
    payBackDate: Number, // When do we have to pay the investor the money back

    torbenMonthly: Number, // Torbens Monthly Profit Procentage
    torbenYearly: Number, // Torbens Yearly Profit Procentage
    torbenEnd: Number, // Torbens When investment ends Profit Procentage

    description: String, // Any comments or special deals

    createdDate: Number, // When was this investor created
    createdBy: String, // Who created the investor
    modifiedDate: Number, // When was this investor modified
    modifiedBy: String, // Who modified the investor
  },
  { versionKey: false }
);
