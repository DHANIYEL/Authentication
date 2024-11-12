import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport'; // Import from 'passport' package, not './middleware/Token.js'
import DbConnect from './libs/db.js';
import AuthRoutes from './routes/Auth.route.js';
import authenticateToken from './middleware/Token.js';
import User from './models/User.js';
import './utils/passport.js'; // Ensure your custom Passport strategy setup is imported
import jwt from 'jsonwebtoken'

dotenv.config();
const app = express();
DbConnect();
app.use(express.json());
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes and logic remain unchanged
app.use('/auth', AuthRoutes);
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: `Welcome ${user.name}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the profile' });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/' 
    }), 
  (req, res) => {
    // After successful Google login, generate a JWT token for the authenticated user
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token and user information to the client
    res.send(
       `Login successful, <h1>welcome ${req.user.name || req.user.displayName}!</h1>`, // Display the user's name
      // token: token, // Send the token back in the response body
    );
  }
);
app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Welcome to the protected area, <h1>Welcome ${req.user.name || req.user.displayName}!</h1>`); // Display the user's name
})


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
