import { Models } from '../../../models';
import { boundedAsyncHandler } from '../../errors';

const asyncHandler = boundedAsyncHandler({ type: 'Investor', message: 'Could not perform desired investor operation!' });

export const InvestorFactory = {
  createInvestor: asyncHandler(async _investor => {
    const { 
      name, nickname, pincode, address, postcode, city, country, email, phone, facebook, passport, beneficiaryName, beneficiaryEmail, beneficiaryPhone,
      transferType, transferInfo, currency, createdBy, modifiedBy, folderId, documentsFolderId, 
    } = _investor;

    const investor = await Models.Investor.create({ 
      name, nickname, pincode, address, postcode, city, country, email, phone, facebook, passport, beneficiaryName, beneficiaryEmail, beneficiaryPhone,
      transferType, transferInfo, currency, createdBy, modifiedBy, folderId, documentsFolderId, passportImages: []
    });

    return investor;
  }),
  findByEmail: asyncHandler(async email => {
    const investor = await Models.Investor.findOne({ email });
    return investor;
  }),
  getInvestors: asyncHandler(async () => {
    const investorsData = await Models.Investor.find();
    const investors = investorsData.map(investor => ({
      id: investor._id.toString(),
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
    const investorData = await Models.Investor.findById(investorId);
    if (investorData) {
      const investor = {
        id: investorData._id.toString(),
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
    return undefined;
  }),
};