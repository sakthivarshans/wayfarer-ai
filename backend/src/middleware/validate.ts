import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Builds a middleware that parses `req.body` / `req.params` / `req.query`
 * against the given zod schemas and replaces each with its parsed
 * (defaulted/coerced) value. Every route should validate its input through
 * this before doing anything else. A failed parse throws `ZodError`, which
 * `errorHandler` turns into a consistent 400 VALIDATION_ERROR response.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
