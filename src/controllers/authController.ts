import { Request, Response } from 'express';
import { UsersService } from '../services';
import { generateTokens } from '../utils/jwt';
import { createApiResponse, handleAsync } from '../utils/response';
import { AuthRequest } from '../types';

export const register = handleAsync(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role, studentId, employeeId, department } = req.body;

  // Check if user already exists
  const existingUser = await UsersService.findByEmail(email);
  if (existingUser) {
    return res.status(409).json(createApiResponse(false, 'User with this email already exists'));
  }

  // Check if studentId or employeeId already exists
  if (studentId) {
    const existingStudent = await UsersService.findByStudentId(studentId);
    if (existingStudent) {
      return res.status(409).json(createApiResponse(false, 'Student ID already exists'));
    }
  }

  if (employeeId) {
    const existingEmployee = await UsersService.findByEmployeeId(employeeId);
    if (existingEmployee) {
      return res.status(409).json(createApiResponse(false, 'Employee ID already exists'));
    }
  }

  // Create new user
  const user = await UsersService.create({
    email,
    password,
    firstName,
    lastName,
    role,
    studentId,
    employeeId,
    department
  });

  // Generate tokens
  const tokens = generateTokens(user);

  return res.status(201).json(createApiResponse(true, 'User registered successfully', tokens));
});

export const login = handleAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await UsersService.findByCredentials(email, password);
  
  if (!user) {
    return res.status(401).json(createApiResponse(false, 'Invalid email or password'));
  }

  // Update last login
  await UsersService.updateLastLogin(user._id);

  // Generate tokens
  const tokens = generateTokens(user);

  return res.json(createApiResponse(true, 'Login successful', tokens));
});

export const getProfile = handleAsync(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json(createApiResponse(false, 'User not found'));
  }

  const profile = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    role: user.role,
    department: user.department,
    studentId: user.studentId,
    employeeId: user.employeeId,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  return res.json(createApiResponse(true, 'Profile retrieved successfully', profile));
});

export const updateProfile = handleAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  const { firstName, lastName, department } = req.body;

  const user = await UsersService.update(userId!, { firstName, lastName, department });

  if (!user) {
    return res.status(404).json(createApiResponse(false, 'User not found'));
  }

  return res.json(createApiResponse(true, 'Profile updated successfully', user));
});

export const changePassword = handleAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  const { currentPassword, newPassword } = req.body;

  const user = await UsersService.findByCredentials(req.user!.email, currentPassword);
  
  if (!user) {
    return res.status(400).json(createApiResponse(false, 'Current password is incorrect'));
  }


  // Update password
  await UsersService.updatePassword(userId!, newPassword);

  return res.json(createApiResponse(true, 'Password changed successfully'));
});

export const logout = handleAsync(async (req: AuthRequest, res: Response) => {
  // In a more complex setup, you might want to blacklist the token
  // For now, we'll just send a success response
  return res.json(createApiResponse(true, 'Logged out successfully'));
});