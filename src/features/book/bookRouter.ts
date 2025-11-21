import express from "express";
import { creatteBook } from "./bookController.ts";
import multer from "multer";
import path, { dirname } from "node:path";
import { fileURLToPath } from "url";

// Multer Middleware
const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({
  dest: path.resolve(__dirname, "../../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 3e7 = 30mb
});

const bookRoutes = express.Router();

bookRoutes.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  creatteBook
);

export default bookRoutes;
