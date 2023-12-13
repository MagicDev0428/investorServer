// Balance Model
// This model is the structure containing all information about the INVESTORS BALANCE (money in and out)
//
var mongoose       = require('mongoose');
var Schema         = mongoose.Schema;
var balanceSchema  = new Schema({
    _id:                Number,     // Transaction Number

    investorName:       String,     // Name from Investors Table 

    profitMonth:        Number,     // Which month/year did investor get this profit
    profitMonthPaid:    Boolean,    // Has profit been paid this month?  (If we set this to true, then set emailDate to 0)
    emailDate:          Number,     // Date and Time the email was sent (ALWAYS set this to 0 when create new record)

    deposit:            Number,     // Amount deposited into investors account (profit)
    withdraw:           Number,     // Amount withdraw from investors account (payment)
    transferDate:       Number,     // Transaction transfer Date and Time

    transactionFrom:    String,     // Transfer transaction FROM bank / account 
    transactionTo:      String,     // Transfer transaction TO bank / account 
    transactionNo:      String,     // Transaction number from bank 

    transferMethod:     String,     // Envelope/Thai Bank/Forign Bank/Crypto 

    description:        String,     // Description of what happened 
    hiddenRemark:       String,     // Hidden Description that only we can see
    attachments:        Array,      // Array of Images and files ("filename","filename") containing transfer reciepts

    createdDate: {                  // When was this investor created
        type: Date, 
        default: Date.now
    },                            
    createdBy:          String,     // Who created the investor
    modifiedDate: {                 // When was this investor modified
        type: Date, 
        default: Date.now
    },     
    modifiedBy:         String      // Who modified the investor
    
}, { versionKey: false });          // Don't want to insert _v in document

module.exports = mongoose.model('balanceModel', balanceSchema,'balance');



