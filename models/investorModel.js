// Investor Model
// This model is the structure containing all information about the INVESTOR
//
import mongoose from 'mongoose'; 
const Schema = mongoose.Schema;

const schema = new Schema({
    name:               String,     // Investor Name
    nickname:           String,     // The investors Nick Name 
    status: {
        type: String,
        default: 'DISABLED'
    },     // INVESTOR, PENDING, DISABLED 
    pincode:            String,     // Pincode for logging in "0202" 
    // don't need this here, auth0 is handling it
    // admin:              Boolean,    // Admin or not  
    // googleAuth:         String,     // Not quite sure what format this is ?!?

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

    folderId: String, // Root folder belonging to the investor
    documentsFolderId: String,
    passportsFolderId: String,

    passportImages:     Array,      // Array of Images of the passports / IDs ("filename","filename")

    createdDate: {
        type: Date, 
        default: Date.now
    },     // When was this investor created
    createdBy:          String,     // Who created the investor
    modifiedDate: {
        type: Date, 
        default: Date.now
    },     // When was this investor modified
    modifiedBy:         String      // Who modified the investor

}, { versionKey: false });      // Don't want to insert _v in document
export const Investor = mongoose.model('Investor', schema,'investors');
