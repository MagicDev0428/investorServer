// Log Model
// This model is the structure containing all information about the LOG of all activities
//
var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var logSchema = new Schema({

    _id: {                         // REQUIRED Log Date and Time
        type: Date, 
        default: Date.now
    },                            
    logBy:              String,     // Users Name (Bee/Torben) 
    logType:            String,     // EMAIL, ADAM, WITHDRAW, REINVEST, INVEST, PROFIT, CUSTOMER.... 
    investorName:       String,     // Name from Investors Table 
    investmentNo:       Number,     // Investment Number from Investment Table
    description:        String      // Description of what happened 

}, { versionKey: false });          // Don't want to insert _v in document

module.exports = mongoose.model('logModel', logSchema,'log');
