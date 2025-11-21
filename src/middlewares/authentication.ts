import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.ts";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) {
      return next(createHttpError(400, "Authorization Required"));
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const decode = jwt.verify(token, config.jwt_secret as string);
    const _req = req as AuthRequest;
    _req.userId = decode.sub as string;

    next();
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export default authenticate;
