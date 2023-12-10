const mongoose = require("mongoose");

module.exports.investorSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Investor Name
    nickName: { type: String, required: true }, // The investors Nick Name
    status: { type: String, required: true, default: "DISABLED" }, // INVESTOR, PENDING, DISABLED
    pincode: String, // Pincode for logging in "0202"
    admin: { type: Boolean, default: false, required: true }, // Admin or not
    googleAuth: String, // Not quite sure what format this is ?!?

    address: String, // Address
    postcode: Number, // Postcode
    city: String, // City
    country: String, // Country
    email: String, // Email address
    phone: String, // Mobile Phone
    facebook: String, // Facebook Link
    passport: String, // Passport Number

    beneficiaryName: String, // Beneficiary Name
    beneficiaryEmail: String, // Beneficiary Email
    beneficiaryPhone: String, // Beneficiary Mobile Phone

    transferType: String, // Money Transfer Type
    transferInfo: String, // Money Transfer Information (bank etc.)
    currency: String, // Prefered currency of the investor

    passportImages: Array, // Array of Images of the passports / IDs ("filename","filename")

    createdDate: Date, // When was this investor created
    createdBy: String, // Who created the investor
    modifiedDate: Date, // When was this investor modified
    modifiedBy: String, // Who modified the investor
  },
  { versionKey: false }
);
