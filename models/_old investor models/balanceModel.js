const mongoose = require("mongoose");
const { accountBalanceSchema } = require("../../schema/investor/balanceSchema");

module.exports.balanceModel = mongoose.model("balance", accountBalanceSchema);
