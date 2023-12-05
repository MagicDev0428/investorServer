class BaseError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

export class FailServerError extends BaseError {
  constructor(message = 'Something went wrong') {
    super('FailServerError', message);
  }  
};

export class NotFoundError extends BaseError {
  constructor(message = 'Not Found') {
    super('NotFoundError', message);
  }
};

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super('ForbiddenError', message);
  }
};

export class ResourceExistsError extends BaseError {
  constructor(message = 'ResourceExists') {
    super('ResourceExistsError', message);
  }
};

export class ValidationError extends BaseError {
  constructor(message = 'ValidationError') {
    super('ValidationError', message);
  }
};

export const boundedAsyncHandler = ({ type, message }) => fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error(`Error ${type} Factory:`, error);
    throw new FailServerError(message);
  }
};