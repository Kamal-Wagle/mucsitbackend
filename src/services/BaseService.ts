import { Model, Document } from 'mongoose';
import { IBaseService } from '../interfaces/IService';
import { QueryOptions } from '../types';

export abstract class BaseService<T extends Document> implements IBaseService<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findAll(options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      filter = {}
    } = options;

    let query = this.model.find(filter);

    // Add text search if supported and search term provided
    if (search && this.hasTextIndex()) {
      query = query.find({ $text: { $search: search } });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(search && this.hasTextIndex() 
        ? { ...filter, $text: { $search: search } } 
        : filter)
    ]);

    return { data, total };
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  protected hasTextIndex(): boolean {
    // Override in child classes if text search is supported
    return false;
  }

  protected buildQuery(options: QueryOptions): any {
    const query: any = {};
    
    if (options.filter) {
      Object.assign(query, options.filter);
    }

    return query;
  }
}