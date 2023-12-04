import { Schema, model } from 'mongoose';

const schema = new Schema({
  investor: {
    type: Schema.Types.ObjectId,
    ref: 'Investor',
    required: true
  },
  documentType: {
    type: String, // e.g., 'Contract', 'Report', 'Invoice'
    required: true
  },
  title: {
    type: String, // A descriptive title for the document
    required: true
  },
  fileId: {
    type: String, // ID of the file by which it is stored on google drive
    required: true
  },
  uploadDate: {
    type: Date, // When the document was uploaded
    default: Date.now
  },
  lastModified: {
    type: Date, // Track when the document was last modified
    default: Date.now
  },
  metadata: {
    type: Map,
    of: String
  },
  tags: [String],
  notes: String
});

export const Document = model('Document', schema, 'documents');