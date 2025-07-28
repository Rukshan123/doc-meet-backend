import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post("/update-profile", upload.single("image"), authUser, updateUserProfile);

export default userRouter;
