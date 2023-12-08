import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import { DocumentTypes, AUTH0_NAMESPACE, ROLES } from '../../constants';
import { ForbiddenError } from '../errors';

export const validateName = () => body('name').trim().notEmpty().withMessage('Name is required');
export const validateNickname = () => body('nickname').trim().optional();
export const validatePhone = () => body('phone').trim().notEmpty().withMessage('Phone is required');
export const validateEmail = () => body('email').trim().isEmail().withMessage('Not a valid e-mail address');
export const validateAddress = () => body('address').trim().notEmpty().withMessage('Address is required');
export const validatePostcode = () => body('postcode').trim().isPostalCode('any').withMessage('Zip code should be valid');
export const validateBeneficiaryName = () => body('beneficiaryName').trim().notEmpty().withMessage('Beneficiary name is required');
export const validateBeneficiaryEmail = () => body('beneficiaryEmail').trim().isEmail().withMessage('Not a valid Beneficiary e-mail address');
export const validateBeneficiaryPhone = () => body('beneficiaryPhone').trim().notEmpty().withMessage('Beneficiary phone is required');

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

/* this is the middleware to check the admin access */
/* access_token has roles array embedded which tells which roles a give user have */
/* auth0 function which is defined in the app.js adds auth object to the req object when a access_token is provided with the request */
export const checkAdminPrivileges = (req, res, next) => {
  if (req.auth) {
    /* check if there is investor-system object is present in the auth object */
    const namespace = req.auth[AUTH0_NAMESPACE];
     /* the object must have roles array and that roles must have admin string */
    if (namespace.roles && namespace.roles.includes(ROLES.admin)) {
      /* continue on success */
      return next();
    }

    throw new ForbiddenError('Admin token is required. You are not authorized to access this endpoint');
  }

  throw new ForbiddenError('auth is missing from req. You are not authorized to access this endpoint');
};

/* this is the middleware to check the investor access */
/* access_token has roles array embedded which tells which roles a give user have */
/* auth0 function which is defined in the app.js adds auth object to the req object when a access_token is provided with the request */
/* each user created by auth0 get investor role automatically */
export const checkInvestorPrivileges = (req, res, next) => {
  if (req.auth) {
    /* check if there is investor-system object is present in the auth object */
    const namespace = req.auth[AUTH0_NAMESPACE];
    /* the object must have roles array and that roles must have investor string  */
    if (namespace.roles && namespace.roles.includes(ROLES.investor)) {
      /* continue on success */
      return next();
    }
    throw new ForbiddenError('Investor token is required. You are not authorized to access this endpoint');
  }

  throw new ForbiddenError('auth is missing from req. You are not authorized to access this endpoint');
};