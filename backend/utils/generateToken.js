import jwt from 'jsonwebtoken';

// Embeds both the account id and its role (citizen/officer/admin) in the
// token, since the three roles live in separate collections.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;
