const mongoose = require("mongoose");
const { adamSchema } = require("../../schema/adam/adamSchema");

module.exports.adamModel = mongoose.model("adam", adamSchema);
