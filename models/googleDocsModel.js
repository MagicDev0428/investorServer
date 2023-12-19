// googleDocs Model
// This model is how we translate from REAL filenames/foldernames to google docs ID's
//
var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var googleDocsSchema = new Schema({

  _id: {                         // REQUIRED Date and Time Key
        type: Date, 
        default: Date.now
    },                

    investorName:       String,     // Name from Investors Table 
    realName:           String,     // Real name of file or folder
    googleId:           String,     // google ID of file or folder

    uploadDate: {
      type: Date,                   // When the document was uploaded
      default: Date.now
    },
    lastModified: {
      type: Date,                   // Track when the document was last modified
      default: Date.now
    }

}, { versionKey: false });          // Don't want to insert _v in document

module.exports = mongoose.model('googleDocsModel', googleDocsSchema,'googleDocs');

