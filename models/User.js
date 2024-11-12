import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  // If the user is not an OAuth user and the password is modified, hash it
  if (!this.isOAuthUser && this.isModified('password')) {
    try {
      // Salt the password with a cost factor of 10 (you can adjust this value)
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
