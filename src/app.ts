import express, { type Request, type Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler.ts";
import userRoutes from "./features/user/userRouter.ts";

const app = express();

// Middlewares
app.use(express.json());

// Routes
// HTTP Methods: GET, POST, PUT, PATCH, DELETE
app.get("/", (req: Request, res: Response) => {
  // const error = createHttpError("Something went wrong");
  // throw error;

  res.json({
    message: "Welcome to Ebook Apis",
  });
});

app.use("/api/users", userRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
