// Invoice Model
// This model is the structure containing all information about INVOICES
//
import mongoose from 'mongoose'; 
const Schema = mongoose.Schema;
const invoiceSchema = new Schema({

    invoiceDate: {                  // REQUIRED Date of Invoice
        type: Date, 
        default: Date.now
    },
    name:               String,     // REQUIRED Invoice Name
    description:        String,     // Invoice description

    invoiceLines:       Object,     // Array of lines who belong to invoice 

//  {
//     "lineNo"  : 1,
//     "Text"    : "BTC profit (all normal investors)",
//     "Amount"  : 13,587,232
//  },
//  {
//     "lineNo"  : 2,
//     "Text"    : "Profit Michael  (108,000 / 2 = 54,000)",
//     "Amount"  : 54,000
//  },
// etc.....

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

export const Invoice = mongoose.model('Invoice', invoiceSchema, 'invoice');
