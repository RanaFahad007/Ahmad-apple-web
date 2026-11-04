import { validationResult } from 'express-validator';
import { AppError } from '../utils/helpers.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array().map((e) => e.msg).join(', '), 400));
  }
  return next();
}
