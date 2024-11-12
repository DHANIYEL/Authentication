import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow Google ID to be optional if not OAuth user
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Only require the password if the user is not created through OAuth
        return !this.isOAuthUser;
      },
      select: false,  // Exclude the password field by default when querying users
    },
    isOAuthUser: {
      type: Boolean,
      default: false,  // Mark as true for OAuth users
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    otpExpiration: Date, // OTP expiration
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
