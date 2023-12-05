const { validationResult } = require('express-validator')
import {
  validateDocumentId, validateDocumentType, validateEmail, validateInvestorId, 
  validateInvestorIdParameter, validateName, validateNickname, validatePhone, validateBeneficiaryEmail,
  validateBeneficiaryName, validateBeneficiaryPhone
} from './validation-middlewares';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.failValidationError(errors.array().map(error => ({ [error.path]: error.msg })));
};

export const createInvestor = [
  validateName(), validatePhone(), validateEmail(), validateBeneficiaryEmail(), validateBeneficiaryName(), validateBeneficiaryPhone(),
  validate
];
export const createDocument = [validateInvestorId(), validateDocumentType(), validate];
export const sendDocument = [validateInvestorIdParameter(), validateDocumentId(), validate];
export const getInvestor = [validateInvestorIdParameter(), validate];