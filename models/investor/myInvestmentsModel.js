const mongoose = require("mongoose");
const {
  myInvestmentsSchema,
} = require("../../schema/investor/myInvestmentsSchema");

module.exports.myInvestmentsModel = mongoose.model(
  "myinvestments",
  myInvestmentsSchema
);
