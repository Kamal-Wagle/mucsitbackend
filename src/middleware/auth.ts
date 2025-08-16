import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IUser, UserRole, AuthRequest } from '../types';
import { config } from '../config/environment';
import { createApiResponse } from '../utils/response';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json(createApiResponse(false, 'Access token is required'));
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; iat: number; exp: number };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json(createApiResponse(false, 'Invalid or expired token'));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json(createApiResponse(false, 'Invalid or expired token'));
    return;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createApiResponse(false, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(createApiResponse(false, 'Insufficient permissions'));
      return;
    }

    next();
  };
};

export const checkResourceOwnership = (resourceModel: any, ownerField: string = 'author') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params?.id;
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        res.status(404).json(createApiResponse(false, 'Resource not found'));
        return;
      }

      const isOwner = resource[ownerField].toString() === req.user?._id.toString();
      const isAdmin = req.user?.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        res.status(403).json(createApiResponse(false, 'Access denied. You can only modify your own resources'));
        return;
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json(createApiResponse(false, 'Server error'));
      return;
    }
  };
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};