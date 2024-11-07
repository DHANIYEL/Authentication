import express from 'express';
import dotenv from "dotenv"
import DbConnect from "./libs/db.js"
import AuthRoutes from './routes/Auth.route.js';
import authenticateToken from "./middleware/Token.js";

dotenv.config();
const app = express();
DbConnect();
app.use(express.json());

app.use("/auth", AuthRoutes);

app.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "User profile data" });
});

const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
});