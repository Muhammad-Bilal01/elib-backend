import createHttpError from "http-errors";
import { type NextFunction, type Request, type Response } from "express";
import { userModel } from "./userModel.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.ts";

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
  const hashPassword = await bcrypt.hash(password, 10);
  // salt define how much time to make hash passpord -> 10 is ideal
  //   console.log("Hash Password", hashPassword);

  //   create New User
  const newUser = await userModel.create({
    name,
    email,
    password: hashPassword,
  });

  //  Token Generation with  JWT
  const token = jwt.sign({ sub: newUser._id }, config.jwt_secret as string, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  // Response
  res.status(201).json({
    accessToken: token,
    message: "User created succefully!",
  });
};
