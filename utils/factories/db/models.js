import mongoose from 'mongoose';

const investorSchema = new mongoose.Schema({
  name: String,
  nickname: String,
  email: String,
  country: String,
  phone: String,
  zipcode: String,
  address: String,
  city: String,
  status: String,
  folderId: String, // Root folder belonging to the investor
  documentsFolderId: String, // Documents folder id for the investor
});

export const Investor = mongoose.model('Investor', investorSchema);