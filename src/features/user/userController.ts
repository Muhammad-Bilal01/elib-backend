import createHttpError from "http-errors";
import { type NextFunction, type Request, type Response } from "express";
import { userModel } from "./userModel.ts";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All Feilds are required!");
    return next(error);
  }
  // Process
  const existUser = await userModel.findOne({ email });
  //   check user already exist or not
  if (existUser) {
    const error = createHttpError(409, "Email Already Exist");
    return next(error);
  }

  //   hash assword

  // Response
  res.status(201).json({
    message: "User created succefully!",
  });
};
