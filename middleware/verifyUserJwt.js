const jwt = require("jsonwebtoken");
const { jwt_secret_key } = require("../utils/constant");

const verifyUserJwt = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    console.log(token)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, jwt_secret_key, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // Ensure the role is "user"
      if (decoded.role !== "user") {
        return res.status(403).json({ message: "Forbidden: Unauthorized role" });
      }

      req.user = decoded; // Attach user data to request for further use
      next(); // Move to the next middleware/controller
    });

  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = verifyUserJwt;
