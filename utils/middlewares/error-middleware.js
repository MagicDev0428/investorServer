import { FailServerError, ForbiddenError, NotFoundError, ResourceExistsError, ValidationError } from '../errors';

export const errorMiddleware = (err, req, res, next) => {
	
  if (err instanceof FailServerError) {
    return res.failServerError(err.message, err.name);
  } else if (err instanceof ForbiddenError) {
    return res.failForbidden(err.message, err.name);
  } else if (err instanceof NotFoundError) {
    return res.failNotFound(err.message, err.name);
  } else if (err instanceof ResourceExistsError) {
    return res.failResourceExists(err.message, err.name);
  } else if (err instanceof ValidationError) {
    return res.failValidationError(err.message, err.name);
  } else {
    next(err);
  }

};