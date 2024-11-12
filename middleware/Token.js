import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from '../models/User.js'; // Adjust the path to your User model if needed
import dotenv from 'dotenv'

dotenv.config();

// Configure Passport to use the Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth profile:', profile);  // Log the entire profile object
  console.log('Access Token:', accessToken);  // Log the access token

  // Handle user authentication or creation
  User.findOne({ googleId: profile.id })
    .then(user => {
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true,
        });
        return user.save();
      }
      return user;
    })
    .then(user => done(null, user))
    .catch(err => {
      console.error('Error during Google OAuth authentication:', err);
      done(err, null);
    });
}));
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});



// Middleware for JWT authentication
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    // Attach the decoded user to the request object
    req.user = decoded;  // This assumes the token contains the userId
    next();
  });
}


export default authenticateToken;
