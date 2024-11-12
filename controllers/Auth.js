import bcrypt from 'bcrypt'; // Use import for ES module
import User from '../models/User.js'; // Adjust path as necessary
import { SendVerificationCode } from "../middleware/Email.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Generate Access and Refresh Tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// Sign In Function
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email }).select('password isVerified'); // Select password and isVerified field
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify the password using bcrypt.compare() (asynchronous)
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(400).json({ message: "Invalid email or password" });
    // }

    // Check if the email is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in" });
    }

    // Generate Access and Refresh Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Send the tokens in the response
    return res.status(200).json({
      message: "Login successful",
      accessToken,   // Access Token to be used for authentication
      refreshToken,  // Refresh Token for session management
    });
  } catch (error) {
    console.error("Error during login:", error); // Detailed error logging
    return res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
};
// Signup function to register a new user
// In your signup function:
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before saving the user
    const hashedPassword = bcrypt.hashSync(password, 10); // Hashing password synchronously

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false, // New user, not verified by default
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during signup:", error); // Detailed error logging
    return res.status(500).json({ message: "An error occurred during signup" });
  }
};


// OTP verification function to verify the code
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    // Find the user by the verification code
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if the OTP has expired
    if (new Date() > new Date(user.otpExpiration)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationCode = undefined; // Clear the verification code
    user.otpExpiration = undefined; // Clear OTP expiration
    await user.save();

    // Respond with successful login message
    return res
      .status(200)
      .json({ message: "Successfully logged in and email verified!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred during verification" });
  }
};

// Resend OTP for email verification
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the OTP has expired or not
    if (new Date() < new Date(user.otpExpiration)) {
      return res.status(400).json({
        message: "OTP is still valid. Please verify the existing OTP.",
      });
    }

    // Generate a new OTP and update the user
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
    const newOtpExpiration = new Date();
    newOtpExpiration.setMinutes(newOtpExpiration.getMinutes() + 5); // OTP valid for 5 minutes

    user.verificationCode = newVerificationCode;
    user.otpExpiration = newOtpExpiration;

    await user.save();

    // Send the new OTP to the user
    SendVerificationCode(user.email, newVerificationCode);

    return res.status(200).json({
      message: "New OTP sent successfully. Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while resending OTP" });
  }
};

export { signup, verifyEmail, resendOTP, signIn };
