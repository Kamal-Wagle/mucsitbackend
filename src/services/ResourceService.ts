import { Resource } from '../models/Resource';
import { IResource, ResourceType } from '../types';
import { ContentService } from './ContentService';

export class ResourceService extends ContentService<IResource> {
  constructor() {
    super(Resource);
  }

  async findById(id: string, populateAuthor: boolean = false): Promise<IResource | null> {
    let query = this.model.findById(id);
    
    if (populateAuthor) {
      query = query.populate('author', 'firstName lastName fullName');
    }
    
    return await query;
  }

  async findAll(options: any = {}): Promise<{ data: IResource[]; total: number }> {
    const { populateAuthor = false } = options;
    
    const result = await super.findAll(options);
    
    if (populateAuthor) {
      let query = this.model.find(this.buildQuery(options));
      query = query.populate('author', 'firstName lastName fullName');
      
      const skip = ((options.page || 1) - 1) * (options.limit || 10);
      result.data = await query
        .sort(options.sort || '-createdAt')
        .skip(skip)
        .limit(options.limit || 10);
    }
    
    return result;
  }

  async findByType(type: ResourceType, options: any = {}): Promise<{ data: IResource[]; total: number }> {
    const filter = { ...options.filter, type };
    return await this.findAll({ ...options, filter });
  }

  async findByCategory(category: string, options: any = {}): Promise<{ data: IResource[]; total: number }> {
    const filter = { ...options.filter, category };
    return await this.findAll({ ...options, filter });
  }

  async findByTags(tags: string[], options: any = {}): Promise<{ data: IResource[]; total: number }> {
    const filter = { ...options.filter, tags: { $in: tags } };
    return await this.findAll({ ...options, filter });
  }

  async getMostDownloaded(limit: number = 10): Promise<IResource[]> {
    return await this.model
      .find({ isPublic: true })
      .sort({ downloads: -1 })
      .limit(limit)
      .populate('author', 'firstName lastName fullName');
  }

  async getMostViewed(limit: number = 10): Promise<IResource[]> {
    return await this.model
      .find({ isPublic: true })
      .sort({ views: -1 })
      .limit(limit)
      .populate('author', 'firstName lastName fullName');
  }

  async getRecentlyAdded(limit: number = 10): Promise<IResource[]> {
    return await this.model
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'firstName lastName fullName');
  }
}