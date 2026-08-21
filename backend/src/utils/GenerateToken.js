const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for a given user id.
 * @param {string} userId - Mongo ObjectId as string
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;