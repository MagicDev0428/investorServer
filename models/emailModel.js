// email Model
// This model is the structure containing all email templates
//
var mongoose   = require('mongoose');
var Schema           = mongoose.Schema;
var emailSchema      = new Schema({
    _id:                String,     // REQUIRED Name of the template

    htmlCode:           String,     // All the HTML in the email
    mailList:           Array,      // Array of all investor._id who should recieve this mail ("Torben Rudgaard","Bee Thanawan")

    mailSent:           Date,       // The date this mail was sent
    attachPorfolio:     Boolean,    // Generate PDF of portfolio and attach to the mail 

    language:           String,     // Language of the mail (Danish/English)

    createdDate: {                  // When was this email created
        type: Date, 
        default: Date.now
    },                            
    createdBy:          String,     // Who created the email 

    modifiedDate: {                 // When was this email modified
        type: Date, 
        default: Date.now
    },     
    modifiedBy:         String      // Who modified the email

}, { versionKey: false });          // Don't want to insert _v in document
module.exports = mongoose.model('emailModel', emailSchema,'email');