import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult, param } from 'express-validator';
import { Investor, InvestorFactory } from '../utils/factories/db';
import { ResourceExistsError, ValidationError } from '../utils/errors';
import getGoogleDriveInstance from '../utils/factories/google';
import { InvoiceFactory } from '../utils';

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

router.get('/', async (req, res, next) => {
  
  try {
    const investors = await InvestorFactory.getInvestors();
    res.respond({
      investors
    });
  } catch (error) {
    next(error);
  }
  
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

router.get('/:investorId', async (req, res, next) => {
  const investorId = req.params.investorId;
  if (mongoose.isValidObjectId(investorId) === false) {
    return next(new ValidationError(`Provided investorId is not a valid id`));
  }

  try {
    const investorData = await InvestorFactory.getInvestor(investorId);
    // remove folder ids
    const investor = {
      id: investorData.id, name: investorData.name, nickname: investorData.nickname, email: investorData.email, phone: investorData.phone, 
      address: investorData.address, zipcode: investorData.zipcode, city: investorData.zipcode, country: investorData.country, 
      status: investorData.status
    };
    res.respond({
      investor
    });
  } catch (error) {
    next(error);
  }
  
});

router.post('/:investorId/invoice', async (req, res, next) => {
  const investorId = req.params.investorId;
  if (mongoose.isValidObjectId(investorId) === false) {
    return next(new ValidationError(`Provided investorId is not a valid id`));
  }

  try {
    const investor = await InvestorFactory.getInvestor(investorId);
    const invoice = {
      logo_url: 'https://sparksuite.github.io/simple-html-invoice-template/images/logo.png',
      invoice: {
        number: '123',
        date: 'January 1, 2023',
        due_date: 'February 1, 2023'
      },
      company: {
        name: 'Sparksuite, Inc.',
        street: '12345 Sunny Road',
        city: 'Sunnyville, CA',
        zip_code: '12345'
      },
      investor: {
        company_name: investor.name,
        name: investor.name,
        email: investor.email
      },
      payment_method: {
        name: 'Check',
        type: 'Check #',
        id: '1000'
      },
      collection: [
        { name: 'Website design', price: '$300.00' },
        { name: 'Hosting (3 months)', price: '$75.00' },
        { name: 'Domain name (1 year)', price: '$10.00' },
        { name: 'Website design', price: '$300.00' },
        { name: 'Website design', price: '$300.00' },
      ],
      total: '$385.00'
    };
    const pdfPath = await InvoiceFactory.create(invoice);
    const pdfId = await getGoogleDriveInstance().uploadFile(pdfPath, investor.documentsFolderId);

    // delete the temp files
    await InvoiceFactory.delete(pdfPath.replace('.pdf', '.html'));
    await InvoiceFactory.delete(pdfPath);


    res.respond({
      invoiceId: pdfId
    });
  } catch (error) {
    next(error);
  }
  
});