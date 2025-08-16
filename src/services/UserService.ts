import { User } from '../models/User';
import { IUser } from '../types';
import { BaseService } from './BaseService';
import { IUserService } from '../interfaces/IService';

export class UserService extends BaseService<IUser> implements IUserService {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email, isActive: true });
  }

  async findByCredentials(email: string, password: string): Promise<IUser | null> {
    const user = await this.model.findOne({ email, isActive: true }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    return user;
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const user = await this.model.findById(id);
    if (!user) return false;

    user.password = newPassword;
    await user.save();
    return true;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async findByStudentId(studentId: string): Promise<IUser | null> {
    return await this.model.findOne({ studentId, isActive: true });
  }

  async findByEmployeeId(employeeId: string): Promise<IUser | null> {
    return await this.model.findOne({ employeeId, isActive: true });
  }

  async deactivateUser(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, { isActive: false });
    return !!result;
  }
}