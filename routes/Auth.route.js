import express from 'express';
import { resendOTP, signIn, signup, verifyEmail } from "../controllers/Auth.js";

const AuthRoutes = express.Router();

AuthRoutes.post("/signup", signup);
AuthRoutes.post("/verifyemail", verifyEmail);
AuthRoutes.post("/resend-otp", resendOTP);
AuthRoutes.post("/signin", signIn);

export default AuthRoutes