// Balance Model
// This model is the structure containing all information about the INVESTORS BALANCE (money in and out)
//
var mongoose       = require('mongoose');
var Schema         = mongoose.Schema;
var balanceSchema  = new Schema({
    _id:                Number,     // Transaction Number

    investorName:       String,     // Name from Investors Table 

    profitMonth:        Number,     // Which month/year did investor get this profit
    deposit:            Number,     // Amount deposited into investors account (profit)
    withdraw:           Number,     // Amount withdraw from investors account (payment)
    transferDate:       Number,     // Transaction Date and Time

    transactionFrom:    String,     // Transfer transaction FROM bank / account 
    transactionTo:      String,     // Transfer transaction TO bank / account 
    transactionNo:      String,     // Transaction number from bank 

    transferMethod:     String,     // Envelope/Thai Bank/Forign Bank/Crypto 
    transferCurrency:   String,     // THB, DKK, USD, BTC, ETH.... fdsf

    emailDate:          Number,     // Date and Time the email was sent

    description:        String,     // Description of what happened 
    hiddenRemark:       String,     // Hidden Description that only we can see
    attachments:        Array,      // Array of Images and files ("filename","filename") containing transfer reciepts

    createdDate:        Number,     // When was this transaction created
    createdBy:          String,     // Who created the transaction
    modifiedDate:       Number,     // When was this transaction modified
    modifiedBy:         String      // Who modified the transaction
}, { versionKey: false });          // Don't want to insert _v in document

module.exports = mongoose.model('balanceModel', balanceSchema,'balance');



