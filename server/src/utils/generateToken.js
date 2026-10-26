import jwt from 'jsonwebtoken';
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'campuspulse_jwt_secret_dev_key_2024', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'campuspulse_jwt_secret_dev_key_2024');
export default generateToken;
