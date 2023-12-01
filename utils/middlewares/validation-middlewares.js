import { body } from 'express-validator';
import mongoose from 'mongoose';
import { ValidationError } from '../errors';

export const validateName = () => body('name').trim().notEmpty().withMessage('Name is required');
export const validateNickname = () => body('nickname').trim().optional();
export const validatePhone = () => body('phone').trim().notEmpty().withMessage('Phone is required');
export const validateEmail = () => body('email').trim().isEmail().withMessage('Not a valid e-mail address');
export const validateAddress = () => body('address').trim().notEmpty().withMessage('Address is required');
export const validateZipcode = () => body('zipcode').trim().isPostalCode('any').withMessage('Zip code should be valid');
export const validateCity = () => body('city').trim().notEmpty().withMessage('City is required');
export const validateCountry = () => body('country').trim().notEmpty().withMessage('Country is required');

export const validateInvestorId = () => body('investorId').trim()
  .notEmpty().withMessage('investorId is required.').bail()
  .custom(value => mongoose.isValidObjectId(value)).withMessage('Provided investorId is not a valid ObjectId.').bail()
  .customSanitizer(value => mongoose.Types.ObjectId(value));