// Balance Model
// This model is the structure containing all information about the INVESTORS BALANCE (money in and out)
//
var mongoose       = require('mongoose');
var Schema         = mongoose.Schema;
var balanceSchema  = new Schema({

    investorName:       String,     // REQUIRED Name/_id from Investors Table 
    profitMonth:        Date,       // REQUIRED Which month/year did investor get this profit 

    profitMonthPaid: {              // Is false, unless true is sent to the form/controller - once true its set to true, set emailDate to null or zero)
        type: Boolean, 
        default: false
    }, 

    profitOtherPaid: {              // Is false, unless true is sent to the form/controller - once true its set to true, set emailDate to null or zero)
        type: Boolean, 
        default: false
    }, 

    emailDate:          Date,       // Date and Time the email was sent (ALWAYS set this to null or 0 when create new record)

    deposit:            Number,     // Amount deposited into investors account (profit)
    withdraw:           Number,     // Amount withdraw from investors account (payment)
    transferDate:       Number,     // Transaction transfer Date and Time

    transactionFrom:    String,     // Transfer transaction FROM bank / account 
    transactionTo:      String,     // Transfer transaction TO bank / account 
    transactionNo:      String,     // Transaction number from bank 

    transferMethod: {               // "Envelope", "Thai Bank", "Foreign Bank", "Crypto Wallet", "Western Union", "WISE", "Other Transfer" 
        type: String, 
        default: "Envelope"
    }, 

    description:        String,     // Description of what happened 
    attachments:        Array,      // Array of Images and files ("filename","filename") containing transfer reciepts

    createdDate: {                  // When was this balance created
        type: Date, 
        default: Date.now
    },                            
    createdBy:          String,     // Who created the balance

    modifiedDate: {                 // When was this balance modified
        type: Date, 
        default: Date.now
    },  
    modifiedBy:         String      // Who modified the balance

}, { versionKey: false });          // Don't want to insert _v in document

module.exports = mongoose.model('balanceModel', balanceSchema,'balance');



