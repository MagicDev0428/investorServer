// Investor Model
// This model is the structure containing all information about the INVESTOR
//
import mongoose from 'mongoose'; 
const Schema = mongoose.Schema;
const schema = new Schema({
    _id:                String,     // REQUIRED Investor Name
    nickname:           String,     // REQUIRED The investors Nick Name 

    status: {                       // REQUIRED [ ACTIVE, PENDING, DISABLED, FROZEN ]
        type: String,
        default: 'ACTIVE'
    },     

    pincode:            String,     // REQUIRED Pincode for logging in "0202" 

    address:            String,     // Address 
    postcode:           String,     // Postcode
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

    hiddenRemark:       String,     // Hidden Description that only we can see
    copyPaste:          Array,      // Array of texts to copy and paste

    investorFolderId:   String,     // Investor google drive folder id
    folders:            Object,      // Array of folders belonging to THIS investor {"contracts": "ksdhi9us9dtytyhw4ioytsliygi", "id": "kqwersdafsarrs222ioytsliygi", "reciepts/paid": "kqwersdafsarrs222ioytsliygi", "reciepts/invested": "234fsrafsarrs222ioytsliygi"}
    attachments:        Object,      // Array of Images of the passports / IDs 
    
    LastLoginDate: {                // When was the last time this investor logged in or attempted to log in
        type: Date, 
        default: null
    },
    loginAttempts: {                // Number of wrong attempts today, after 3 wrong attempts we change investor.status = "FROZEN"
        type: Number, default: 0, 
    },   

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

}, { versionKey: false });          // Don't want to insert _v in document

export const Investor = mongoose.model('Investor', schema,'investor');
