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
  }
};