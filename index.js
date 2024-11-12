import express from 'express';
import dotenv from "dotenv"
import DbConnect from "./libs/db.js"
import AuthRoutes from './routes/Auth.route.js';
import authenticateToken from "./middleware/Token.js";
import User from './models/User.js';

dotenv.config();
const app = express();
DbConnect();
app.use(express.json());

app.use("/auth", AuthRoutes);

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Use the userId from the decoded token to find the user in the database
    const user = await User.findById(req.user.userId).select("name"); // Only select the name field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a personalized welcome message with the user's name
    return res.status(200).json({
      message: `Welcome ${user.name}`,  // Personalize the message with the user's name
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching the profile",
    });
  }
});



const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
});