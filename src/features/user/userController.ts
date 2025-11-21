import createHttpError from "http-errors";
import { type NextFunction, type Request, type Response } from "express";
import { userModel } from "./userModel.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.ts";
import type { UserType } from "./userTypes.ts";
import { json } from "stream/consumers";

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
  try {
    const existUser = await userModel.findOne({ email });
    //   check user already exist or not
    if (existUser) {
      const error = createHttpError(409, "Email Already Exist");
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "Error while getting existing user"));
  }

  let newUser: UserType;
  try {
    //   hash assword
    const hashPassword = await bcrypt.hash(password, 10);
    // salt define how much time to make hash passpord -> 10 is ideal
    //   console.log("Hash Password", hashPassword);

    //   create New User
    newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating new user"));
  }

  try {
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
  } catch (error) {
    return next(createHttpError(500, "Error while signing jwt token"));
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All Feilds are required"));
  }

  try {
    const existUser = await userModel.findOne({ email });
    if (!existUser) {
      return next(createHttpError(404, "Error User Not Found"));
    }

    const verifyPassword = await bcrypt.compare(password, existUser.password);
    if (!verifyPassword) {
      return next(createHttpError(400, "Error Invalid Credentials"));
    }

    // sign jwt token
    const token = jwt.sign(
      { sub: existUser._id },
      config.jwt_secret as string,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      message: "User Login",
      accessToken: token,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }
};
