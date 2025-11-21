import express from "express";

import { loginUser, registerUser } from "./userController.ts";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);

export default userRoutes;
