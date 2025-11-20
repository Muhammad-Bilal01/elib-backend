import express, { type Request, type Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler.ts";

const app = express();

// Routes
// HTTP Methods: GET, POST, PUT, PATCH, DELETE
app.get("/", (req: Request, res: Response) => {
  // const error = createHttpError("Something went wrong");
  // throw error;

  res.json({
    message: "Welcome to Ebook Apis",
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
