import { Document } from 'mongoose';
import { BaseService } from './BaseService';
import { IContentService } from '../interfaces/IService';
import { QueryOptions } from '../types';

export abstract class ContentService<T extends Document> extends BaseService<T> implements IContentService {
  
  async findByAuthor(authorId: string, options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const filter = { ...options.filter, author: authorId };
    return await this.findAll({ ...options, filter });
  }

  async incrementViews(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  }

  async search(query: string, options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    return await this.findAll({ ...options, search: query });
  }

  async findPublic(options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const filter = { ...options.filter, isPublic: true };
    return await this.findAll({ ...options, filter });
  }

  async findByDepartment(department: string, options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const filter = { ...options.filter, department };
    return await this.findAll({ ...options, filter });
  }

  async findBySubject(subject: string, options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const filter = { ...options.filter, subject };
    return await this.findAll({ ...options, filter });
  }

  async findByCourse(course: string, options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    const filter = { ...options.filter, course };
    return await this.findAll({ ...options, filter });
  }

  protected hasTextIndex(): boolean {
    return true; // Most content models have text indexes
  }
}