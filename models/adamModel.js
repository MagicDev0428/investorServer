// Adam Model
// This model is the structure containing all information about money to and from Adam
//
var mongoose   = require('mongoose');
var Schema           = mongoose.Schema;
var adamSchema = new Schema({
    _id: {                          // REQUIRED Transaction Date and Time
        type: Date, 
        default: Date.now
    },   
    amount:             Number,     // REQUIRED Amount of THB transfered

    transferFrom:       String,     // REQUIRED Transfer money FROM (Adam, Torben, Bee, Other) 
    transferTo:         String,     // REQUIRED Transfer money TO (Adam, Torben, Bee, Other)

    investorName:       String,     // Name from Investors Table 
    investmentNo:       Number,     // Investment Number from Investment Table

    transactionFrom:    String,     // Transfer transaction FROM bank / account 
    transactionTo:      String,     // Transfer transaction TO bank / account 
    transactionNo:      String,     // Transaction number from bank 

    description:        String,     // Description of what happened 
    attachments:        Array,      // Array of Images and files ("filename","filename") containing transfer reciepts

    createdDate: {                  // When was this adam transfer created
        type: Date, 
        default: Date.now
    },                            
    createdBy:          String,     // Who created the adam transfer

    modifiedDate: {                 // When was this adam transfer modified
        type: Date, 
        default: Date.now
    },     
    modifiedBy:         String      // Who modified the adam transfer

}, { versionKey: false });          // Don't want to insert _v in document
module.exports = mongoose.model('adamModel', adamSchema,'adam');