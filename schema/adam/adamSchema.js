// Adam Model
// This model is the structure containing all information about money to and from Adam
//
var mongoose = require("mongoose");
module.exports.adamSchema = new mongoose.Schema(
  {
    _id: Number, // Transaction Date and Time:
    amount: Number, // Amount of THB transfered
    transferFrom: String, // Transfer money FROM (Adam, Torben, Bee, Other)
    transferTo: String, // Transfer money TO (Adam, Torben, Bee, Other)
    investorName: String, // Name from Investors Table
    investmentNo: Number, // Investment Number from Investment Table

    transactionFrom: String, // Transfer transaction FROM bank / account
    transactionTo: String, // Transfer transaction TO bank / account
    transactionNo: String, // Transaction number from bank

    description: String, // Description of what happened
    attachments: Array, // Array of Images and files ("filename","filename") containing transfer reciepts

    createdDate: Number, // When was this transaction created
    createdBy: String, // Who created the transaction
    modifiedDate: Number, // When was this transaction modified
    modifiedBy: String, // Who modified the transaction
  },
  { versionKey: false }
); // Don't want to insert _v in document
