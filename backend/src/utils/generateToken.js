const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const configuredExpiration = String(process.env.JWT_EXPIRES_IN || '7d').trim();
  // jsonwebtoken interprets a bare number as seconds. Treat a simple value
  // such as "7" as days so deployment configuration matches its intent.
  const expiresIn = /^\d+$/.test(configuredExpiration)
    ? `${configuredExpiration}d`
    : configuredExpiration;

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = generateToken;
