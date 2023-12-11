// Investor Model
// This model is the structure containing all information about the INVESTOR
//
import mongoose from 'mongoose'; 
const Schema = mongoose.Schema;

const schema = new Schema({
    name:               String,     // Investor Name
    nickname:           String,     // The investors Nick Name 
    status: {                       // INVESTOR, PENDING, DISABLED 
        type: String,
        default: 'INVESTOR'
    },     
    pincode:            String,     // Pincode for logging in "0202" 

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

    transferType:       String,     // Money Transfer Type "Envelope", "Thai Bank", "Foreign Bank", "Crypto Wallet", "Western Union", "WISE", "Other Transfer"
    transferInfo:       String,     // Money Transfer Information (bank etc.)
    currency:           String,     // Prefered currency of the investor

    folderId:           String,     // Root folder belonging to the investor
    documentsFolderId:  String,     // Documents folder belonging to the investor
    passportsFolderId:  String,     // Passport folder belonging to the investor

    passportImages:     Array,      // Array of Images of the passports / IDs ("filename","filename")

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
export const Investor = mongoose.model('Investor', schema,'investors');
