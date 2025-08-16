// Individual service instances for each feature
// Each service is completely independent to prevent cascading failures

export class NotesService {
  static async findByAuthor(authorId: string, options: any = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    const query = { author: authorId };
    
    const [notes, total] = await Promise.all([
      Note.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-content'),
      Note.countDocuments(query)
    ]);

    return { notes, total };
  }

  static async incrementViews(noteId: string) {
    await Note.findByIdAndUpdate(noteId, { $inc: { views: 1 } });
  }

  static async incrementDownloads(noteId: string) {
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });
  }
}

export class AssignmentsService {
  static async findByInstructor(instructorId: string, options: any = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    const query = { instructor: instructorId };
    
    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(query)
    ]);

    return { assignments, total };
  }

  static async deactivateExpired() {
    const result = await Assignment.updateMany(
      { dueDate: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );
    return result.modifiedCount;
  }
}

// Export as assignmentService for compatibility
export const assignmentService = AssignmentsService;

export class ResourcesService {
  static async findByAuthor(authorId: string, options: any = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    const query = { author: authorId };
    
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query)
    ]);

    return { resources, total };
  }

  static async incrementViews(resourceId: string) {
    await Resource.findByIdAndUpdate(resourceId, { $inc: { views: 1 } });
  }

  static async incrementDownloads(resourceId: string) {
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
  }
}

export class DriveFilesService {
  static async findByUploader(uploaderId: string, options: any = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    const query = { uploadedBy: uploaderId };
    
    const [files, total] = await Promise.all([
      DriveFile.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      DriveFile.countDocuments(query)
    ]);

    return { files, total };
  }

  static async incrementViews(fileId: string) {
    await DriveFile.findByIdAndUpdate(fileId, { $inc: { views: 1 } });
  }

  static async incrementDownloads(fileId: string) {
    await DriveFile.findByIdAndUpdate(fileId, { $inc: { downloads: 1 } });
  }
}

export class UsersService {
  static async findByEmail(email: string) {
    return await User.findOne({ email, isActive: true });
  }

  static async findByStudentId(studentId: string) {
    return await User.findOne({ studentId, isActive: true });
  }

  static async findByEmployeeId(employeeId: string) {
    return await User.findOne({ employeeId, isActive: true });
  }

  static async findByCredentials(email: string, password: string) {
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    return user;
  }

  static async create(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  static async update(userId: string, updateData: any) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  }

  static async updatePassword(userId: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.password = newPassword;
    return await user.save();
  }

  static async updateLastLogin(userId: string) {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  static async deactivateUser(userId: string) {
    const result = await User.findByIdAndUpdate(userId, { isActive: false });
    return !!result;
  }
}

// Import models for services
import { Note } from '../models/Note';
import { Assignment } from '../models/Assignment';
import { Resource } from '../models/Resource';
import { DriveFile } from '../models/DriveFile';
import { User } from '../models/User';