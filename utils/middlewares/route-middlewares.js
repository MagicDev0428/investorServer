const { validationResult } = require('express-validator')
import { validateInvestorId } from './validation-middlewares';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.failValidationError(errors.array().map(error => ({ [error.path]: error.msg })));
};

export const createDocumentMiddlewares = [validateInvestorId(), validate];
