import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import { DocumentTypes } from '../../constants';

export const validateName = () => body('name').trim().notEmpty().withMessage('Name is required');
export const validateNickname = () => body('nickname').trim().optional();
export const validatePhone = () => body('phone').trim().notEmpty().withMessage('Phone is required');
export const validateEmail = () => body('email').trim().isEmail().withMessage('Not a valid e-mail address');
export const validateAddress = () => body('address').trim().notEmpty().withMessage('Address is required');
export const validateZipcode = () => body('zipcode').trim().isPostalCode('any').withMessage('Zip code should be valid');
export const validateCity = () => body('city').trim().notEmpty().withMessage('City is required');
export const validateCountry = () => body('country').trim().notEmpty().withMessage('Country is required');

export const validateInvestorId = () => body('investorId').trim()
  .notEmpty().withMessage(`investorId is required.`).bail()
  .custom(value => mongoose.isValidObjectId(value)).withMessage(`Provided investorId is not a valid ObjectId.`).bail();

export const validateDocumentId = () => body('documentId').trim()
  .notEmpty().withMessage(`documentId is required.`).bail()
  .custom(value => mongoose.isValidObjectId(value)).withMessage(`Provided documentId is not a valid ObjectId.`).bail();

export const validateDocumentType = () => body('documentType').trim()
  .notEmpty().withMessage('documentType can`t be empty').bail()
  .custom(value => Object.values(DocumentTypes).includes(value)).withMessage('Provided documentType is not a valid DocumentType').bail()
  .customSanitizer(value => {
    for (const [key, stringValue] of Object.entries(DocumentTypes)) {
      if (stringValue === value) { return key; }
    }
  });

export const validateInvestorIdParameter = () => param('investorId')
  .custom(value => mongoose.isValidObjectId(value)).withMessage(`Provided investorId is not a valid ObjectId.`);