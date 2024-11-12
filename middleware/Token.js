import jwt  from "jsonwebtoken";

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.user = user;  // Attach the decoded user info to the request object
    next();
  });
}

export default authenticateToken;
