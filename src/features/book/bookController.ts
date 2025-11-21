import type { NextFunction, Request, Response } from "express";

export const creatteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   const {} = req.body;

  res.status(200).json({
    message: "OK",
  });
};
