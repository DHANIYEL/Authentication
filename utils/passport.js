import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Adjust the path if needed

// Configure Passport to use the Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new User({
        googleId: profile.id,   // Store Google ID
        name: profile.displayName,
        email: profile.emails[0].value,
        isOAuthUser: true,       // Flag as an OAuth user
      });
      await user.save();
    }

    // Serialize only the user ID for session storage
    done(null, user);  
  } catch (error) {
    done(error, null);
  }
}));

// Serialize the user into the session
passport.serializeUser((user, done) => {
    done(null, user._id); // Store only the user ID in the session
  });
  
passport.deserializeUser(async (userId, done) => {
    try {
      const user = await User.findById(userId); // Find user by userId stored in the session
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
