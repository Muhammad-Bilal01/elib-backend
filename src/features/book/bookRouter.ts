import express from "express";
import { creatteBook } from "./bookController.ts";

const bookRoutes = express.Router();

bookRoutes.post("/", creatteBook);

export default bookRoutes;
