// Investment Model
// This model is the structure containing all information about the INVESTMENT
//

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var investmentSchema = new Schema(
  {
    _id:                  Number,    // REQUIERED Investment No

    startDate:             Date,     // When do the investment start 
    firstProfitDate:       Date,     // When do the investor get his first profit
    lastProfitDate:        Date,     // When do the investment get his last profit
    endDate:               Date,     // When do the investment end

    investAmount:         Number,    // The amount we want to have invested

    investType: {                    // REQUIRED InvestmentType: Monthly Profit, Annual Profit, One-time Profit, Mixed
      type: String,
      default: "Monthly Profit"
    },

    profitMonthly:        Number,   // Monthly Profit Procentage
    profitYearly:         Number,   // Yearly Profit Procentage
    profitEnd:            Number,   // When investment ends Profit Procentage

    explanation:          String,   // Desscription/Explanation 
    attachments:          Array,    // Array of Images and documents ("filename","filename")

    createdDate: {                  // When was this investment created
        type: Date, 
        default: Date.now
    },                            
    createdBy:            String,   // Who created the investment

    modifiedDate: {                 // When was this investment modified
        type: Date, 
        default: Date.now
    },     
    modifiedBy:         String      // Who modified the investment

  },
  { versionKey: false }
); // Don't want to insert _v in document

module.exports.investmentModel = mongoose.model("investmentModel", investmentSchema, "investment");
