import express from "express";

const app = express();

// Routes
// HTTP Methods: GET, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to Ebook Apis",
  });
});

export default app;
