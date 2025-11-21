import express from "express";

import { registerUser } from "./userController.ts";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);

export default userRoutes;
