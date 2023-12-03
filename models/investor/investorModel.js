const mongoose = require("mongoose");
const { investorSchema } = require("../../schema/investor/investorSchema");

module.exports.investorModel = mongoose.model("investor", investorSchema);
