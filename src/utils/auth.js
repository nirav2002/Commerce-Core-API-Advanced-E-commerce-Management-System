const jwt = require("jsonwebtoken");

/**
 * Verifies and decodes the JWT from the Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {object | null} - Decoded user details or null if invalid
 */

const verifyToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication required"); //No token provided
  }

  //Extract the token
  const token = authHeader.replace("Bearer ", "");

  try {
    //Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; //Return user details (id and role)
  } catch (err) {
    throw new Error("Invalid token"); //Return invalid token for unauthorized access
  }
};

module.exports = { verifyToken };
