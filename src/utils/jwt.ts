import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { IUser } from '../types';

export const generateToken = (userId: string): string => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.sign(
    { userId },
    secret as jwt.Secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.verify(token, secret as jwt.Secret) as { userId: string };
};

export const generateTokens = (user: IUser) => {
  const accessToken = generateToken(user._id);
  
  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId
    }
  };
};