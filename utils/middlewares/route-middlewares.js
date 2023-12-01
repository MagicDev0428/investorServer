const { validationResult } = require('express-validator')
import { 
  validateAddress, validateCity, validateCountry, validateDocumentId, validateDocumentType, validateEmail, validateInvestorId, 
  validateInvestorIdParameter, validateName, validateNickname, validatePhone, validateZipcode 
} from './validation-middlewares';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.failValidationError(errors.array().map(error => ({ [error.path]: error.msg })));
};

export const createInvestor = [
  validateName(), validateNickname(), validatePhone(), validateEmail(), validateAddress(), validateZipcode(), validateCity(), 
  validateCountry(), validate
];
export const createDocument = [validateInvestorId(), validateDocumentType(), validate];
export const sendDocument = [validateInvestorIdParameter(), validateDocumentId(), validate];
