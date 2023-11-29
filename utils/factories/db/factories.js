import { Investor } from './models';
import { FailServerError, ForbiddenError, NotFoundError } from '../../errors';

export const InvestorFactory = {
  async getInvestorFolder(investorId) {
    try {
      const investor = await Investor.findOne(identifier).exec();
      return investor; // This will be 'null' if not found
    } catch (error) {
      console.error("Error fetching investor:", error);
      return undefined;
    }
  },
  async createInvestor({ name, email, nickname, phone, address, zipcode, city, country, status, folderId, documentsFolderId }) {
    try {
      const investor = await Investor.create({ name, email, nickname, phone, address, zipcode, city, country, status, folderId, documentsFolderId });
      return investor;
    } catch (error) {
      console.error("Error creating investor:", error);
      throw new FailServerError();
    }
  },
  async findByEmail(email) {
    try {
      const investor = await Investor.findOne({ email });
      return investor;
    } catch (error) {
      console.error("Error finding investor:", error);
      throw new FailServerError();
    }
  },
  async getInvestors() {
    try {
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
    } catch (error) {
      console.error("Error finding investor:", error);
      throw new FailServerError();
    }
  },
  async getInvestor(investorId) {
    try {
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
    } catch (error) {
      console.error("Error finding investor:", error);
      throw new FailServerError();
    }
  }
};