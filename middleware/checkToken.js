const jwt = require("jsonwebtoken");

function checkJwt(req, res, next) {
    try {
        const JWT_SECRET = "your_secure_jwt_secret_key";
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: "JWT expired" });
    }
}

module.exports = checkJwt;
