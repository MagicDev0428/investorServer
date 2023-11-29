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
  constructor() {
    super('FailServerError', 'Something went wrong');
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