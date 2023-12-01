// Investor Model
// This model is the structure containing all information about the INVESTOR
//
var mongoose       = require('mongoose');// 
var Schema         = mongoose.Schema;
var investorSchema = new Schema({

    _id:                String,     // Investor Name
    nickName:           String,     // The investors Nick Name 
    status:             String,     // INVESTOR, PENDING, DISABLED 
    pincode:            String,     // Pincode for logging in "0202" 
    admin:              Boolean,    // Admin or not  
    googleAuth:         String,     // Not quite sure what format this is ?!?  

    address:            String,     // Address 
    postcode:           Number,     // Postcode
    city:               String,     // City 
    country:            String,     // Country
    email:              String,     // Email address
    phone:              String,     // Mobile Phone
    facebook:           String,     // Facebook Link
    passport:           String,     // Passport Number

    beneficiaryName:    String,     // Beneficiary Name
    beneficiaryEmail:   String,     // Beneficiary Email
    beneficiaryPhone:   String,     // Beneficiary Mobile Phone

    transferType:       String,     // Money Transfer Type
    transferInfo:       String,     // Money Transfer Information (bank etc.)
    currency:           String,     // Prefered currency of the investor

    passportImages:     Array,      // Array of Images of the passports / IDs ("filename","filename")

    createdDate:        Number,     // When was this investor created
    createdBy:          String,     // Who created the investor
    modifiedDate:       Number,     // When was this investor modified
    modifiedBy:         String      // Who modified the investor

}, { versionKey: false });      // Don't want to insert _v in document
module.exports = mongoose.model('investorModel', investorSchema,'investor');
