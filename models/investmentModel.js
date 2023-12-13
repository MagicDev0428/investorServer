// Investment Model
// This model is the structure containing all information about the INVESTMENT
//

var mongoose         = require('mongoose');
var Schema           = mongoose.Schema;
var investmentSchema = new Schema({
    _id:                Number,     // Investment No

    startDate:          Number,     // When do the investment start
    endDate:            Number,     // When do the investment end

    investAmount:       Number,     // The amount we want to have invested
    investType:         String,     // InvestmentType: Monthly Profit, Annual Profit, One-time Profit, Mixed 
 
    profitMonthly:      Number,     // Monthly Profit Procentage
    profitYearly:       Number,     // Yearly Profit Procentage
    profitEnd:          Number,     // When investment ends Profit Procentage

    explanation:        String,     // Desscription/Explanation 
    attachments:        Array,      // Array of Images and documents ("filename","filename")

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
module.exports = mongoose.model('investmentModel', investmentSchema,'investment');

