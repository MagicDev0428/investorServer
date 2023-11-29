import express from 'express';
import { body, validationResult, ExpressValidator } from 'express-validator';
import { Investor, InvestorFactory } from '../utils/factories/db';
import { ResourceExistsError } from '../utils/errors';
import getGoogleDriveInstance from '../utils/factories/google/GoogleDriveFactory';
export const router = express.Router();

/**
 * Validators
 */
const validateName = () => body('name').trim().notEmpty().withMessage('Name is required');
const validateNickname = () => body('nickname').trim().optional();
const validatePhone = () => body('phone').trim().notEmpty().withMessage('Phone is required');
const validateEmail = () => body('email').trim().isEmail().withMessage('Not a valid e-mail address');
const validateAddress = () => body('address').trim().notEmpty().withMessage('Address is required');
const validateZipcode = () => body('zipcode').trim().isPostalCode('any').withMessage('Zip code should be valid');
const validateCity = () => body('city').trim().notEmpty().withMessage('City is required');
const validateCountry = () => body('country').trim().notEmpty().withMessage('Country is required');

router.get('/', (req, res) => {
  res.respond({
    investors: []
  })
});

/**
 * create a new investor
 */
router.post('/', 
  validateEmail(), validateName(), validateNickname(), validatePhone(), validateAddress(), validateZipcode(), validateCity(), validateCountry(),
  async (req, res, next) => {
  const validation = validationResult(req);
  
  if (validation.isEmpty() === false) {
    return res.failValidationError(validation.array());
  }

  const { name, nickname, phone, email, address, zipcode, city, country } = req.body;
  try {
    // make sure email address doesnot exist in the db
    const investorByEmail = await InvestorFactory.findByEmail(email);
    if (investorByEmail) {
      throw new ResourceExistsError(`Email address: ${email} already exists.`);
    }

    // create the folders for the investor
    const client = getGoogleDriveInstance();
    const folderName = name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const { folderId, documentsFolderId } = await client.createFolders(folderName);

    const investor = await InvestorFactory.createInvestor({ name, email, nickname, phone, address, zipcode, city, country, status: 'active', folderId, documentsFolderId });
    if (investor) {
      res.respondCreated({ investorId: investor._id });
    } else {
      res.fail('Investor creation failed');
    }
  } catch (error) {
    next(error);    
  }

});