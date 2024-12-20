import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport"; // Import from 'passport' package, not './middleware/Token.js'
import DbConnect from "./libs/db.js";
import AuthRoutes from "./routes/Auth.route.js";
import authenticateToken from "./middleware/Token.js";
import User from "./models/User.js";
import "./utils/passport.js"; // Ensure your custom Passport strategy setup is imported
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
DbConnect();
app.use(express.json());
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes and logic remain unchanged
app.use("/auth", AuthRoutes);
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: `Welcome ${user.name}` });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the profile" });
  }
});

app.get("/", (req, res) => {
  res.send(`
    <style>
      button {
        background-color: #4CAF99; /* Green background */
        border: none; /* Remove borders */
        color: white; /* White text */
        padding: 15px 32px; /* Add padding */
        text-align: center; /* Center text */
        text-decoration: none; /* Remove underline */
        display: inline-block; /* Display as inline-block */
        font-size: 16px; /* Increase font size */
        margin: 10px 2px; /* Add some margin */
        cursor: pointer; /* Pointer/hand icon */
        border-radius: 8px; /* Rounded corners */
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* Shift 50% horizontally and vertically */
      }

      button a {
        color: white; /* Ensures link text is white */
        text-decoration: none; /* Remove underline */
      }
      button a:hover {
        color: #e0e0e0; /* Light gray text on hover */
      }
    </style>
    <button>
      <a href="auth/google">Sign In</a>
    </button>
  `);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/",
  })
);
app.get("/protected", isLoggedIn, (req, res) => {
  res.send(
    `Login successful, <h1>Welcome ${
      req.user.name || req.user.displayName
    }!</h1>`
  ); // Display the user's name
});

app.get("/logout", (req, res) => {
  // Clear JWT token stored in a cookie if applicable
  res.clearCookie("auth_token"); // This clears the cookie with the JWT token

  // Destroy the session if you are using session management (for example, for OAuth)
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to destroy session" });
    }

    // After clearing the cookie and destroying the session, send the response
    res.status(200).json({ message: "Logged out successfully" });
  });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
