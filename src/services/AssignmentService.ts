import { Assignment } from '../models/Assignment';
import { IAssignment } from '../types';
import { ContentService } from './ContentService';

export class AssignmentService extends ContentService<IAssignment> {
  constructor() {
    super(Assignment);
  }

  async findById(id: string, populateInstructor: boolean = false): Promise<IAssignment | null> {
    let query = this.model.findById(id);
    
    if (populateInstructor) {
      query = query.populate('instructor', 'firstName lastName fullName');
    }
    
    return await query;
  }

  async findAll(options: any = {}): Promise<{ data: IAssignment[]; total: number }> {
    const { populateInstructor = false } = options;
    
    const result = await super.findAll(options);
    
    if (populateInstructor) {
      let query = this.model.find(this.buildQuery(options));
      query = query.populate('instructor', 'firstName lastName fullName');
      
      const skip = ((options.page || 1) - 1) * (options.limit || 10);
      result.data = await query
        .sort(options.sort || '-createdAt')
        .skip(skip)
        .limit(options.limit || 10);
    }
    
    return result;
  }

  async findByInstructor(instructorId: string, options: any = {}): Promise<{ data: IAssignment[]; total: number }> {
    return await this.findByAuthor(instructorId, options);
  }

  async findActive(options: any = {}): Promise<{ data: IAssignment[]; total: number }> {
    const filter = { ...options.filter, isActive: true };
    return await this.findAll({ ...options, filter });
  }

  async findExpired(options: any = {}): Promise<{ data: IAssignment[]; total: number }> {
    const filter = { 
      ...options.filter, 
      dueDate: { $lt: new Date() },
      isActive: true 
    };
    return await this.findAll({ ...options, filter });
  }

  async findUpcoming(days: number = 7, options: any = {}): Promise<{ data: IAssignment[]; total: number }> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const filter = { 
      ...options.filter, 
      dueDate: { $gte: now, $lte: futureDate },
      isActive: true 
    };
    return await this.findAll({ ...options, filter });
  }

  async deactivateExpired(): Promise<number> {
    const result = await this.model.updateMany(
      { dueDate: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );
    return result.modifiedCount;
  }
}