import { Investor } from './models';
import { boundedAsyncHandler } from '../../errors';

const asyncHandler = boundedAsyncHandler({ type: 'Investor', message: 'Could not perform desired investor operation!' });

export const InvestorFactory = {
  createInvestor: asyncHandler(async ({ name, email, nickname, phone, address, zipcode, city, country, status, folderId, documentsFolderId }) => {  
    const investor = await Investor.create({ name, email, nickname, phone, address, zipcode, city, country, status, folderId, documentsFolderId });
    return investor;
  }),
  findByEmail: asyncHandler(async email => {
    const investor = await Investor.findOne({ email });
    return investor;
  }),
  getInvestors: asyncHandler(async () => {
    const investorsData = await Investor.find();
    const investors = investorsData.map(investor => ({
      id: investor._id,
      name: investor.name,
      nickname: investor.nickname,
      email: investor.email,
      phone: investor.phone, 
      address: investor.address, 
      zipcode: investor.zipcode, 
      city: investor.zipcode, 
      country: investor.country, 
      status: investor.status
    }));
    return investors;
  }),
  getInvestor: asyncHandler(async investorId => {    
    const investorData = await Investor.findById(investorId);
    if (investorData) {
      const investor = {
        id: investorData._id,
        name: investorData.name,
        nickname: investorData.nickname,
        email: investorData.email,
        phone: investorData.phone, 
        address: investorData.address, 
        zipcode: investorData.zipcode, 
        city: investorData.zipcode, 
        country: investorData.country, 
        status: investorData.status,
        folderId: investorData.folderId,
        documentsFolderId: investorData.documentsFolderId
      };
      return investor;
    }
    return {};
  }),
};