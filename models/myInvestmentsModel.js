// myInvestments Model
// This model is the structure containing all information about the INVESTORS INVESTMENTS
//
var mongoose             = require('mongoose');
var Schema               = mongoose.Schema;
var myInvestmentsSchema  = new Schema({

    investmentNo:       Number,     // REQUIRED Investment Number from Investment Table
    investorName:       String,     // REQUIRED Name/_id from Investors Table 

    amountInvested:     Number,     // The amount of money invested
    transferDate:       Date,       // Date of the transfer

    transactionFrom:    String,     // Transfer transaction FROM bank / account 
    transactionTo:      String,     // Transfer transaction TO bank / account 
    transactionNo:      String,     // Transaction number from bank 
    documents:          Array,      // Array of Images and reciepts ("filename","filename")

    profitMonthlyPct:   Number,     // Investors Monthly Profit Procentage
    profitMonthly:      Number,     // Investors Monthly Profit Amount
    profitAnnualPct:    Number,     // Investors Yearly Profit Procentage
    profitAnnual:       Number,     // Investors Yearly Profit Amount
    profitEndPct:       Number,     // Investors When investment ends Profit Procentage
    profitEnd:          Number,     // Investors When investment ends Profit Amount 

    investType:         String,     // InvestmentType: Monthly Profit, Annual Profit, One-time Profit, Mixed 
    firstProfitDate:    Date,       // When will we PAY the first PROFIT to the investor
    lastProfitDate:     Date,       // When will we PAY the last PROFIT to the investor
    payBackDate:        Date,       // When do we have to pay the investor the money back (if blank then 6 months notice)

    torbenMonthlyPct:   Number,     // Torbens Monthly Profit Procentage
    torbenMonthly:      Number,     // Torbens Monthly Profit Amount
    torbenAnnualPct:    Number,     // Torbens Yearly Profit Procentage
    torbenAnnual:       Number,     // Torbens Yearly Profit Amount
    torbenEndPct:       Number,     // Torbens When investment ends Profit Procentage
    torbenEnd:          Number,     // Torbens When investment ends Profit Amount

    description:        String,     // Any comments or special deals

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

module.exports = mongoose.model('myInvestmentsModel', myInvestmentsSchema,'myInvestments');
