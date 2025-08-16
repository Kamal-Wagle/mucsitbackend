import { Note } from '../models/Note';
import { INote } from '../types';
import { ContentService } from './ContentService';

export class NoteService extends ContentService<INote> {
  constructor() {
    super(Note);
  }

  async findById(id: string, populateAuthor: boolean = false): Promise<INote | null> {
    let query = this.model.findById(id);
    
    if (populateAuthor) {
      query = query.populate('author', 'firstName lastName fullName');
    }
    
    return await query;
  }

  async getExcerpt(id: string): Promise<string | null> {
    const note = await this.model.findById(id).select('content');
    if (!note) return null;
    
    return note.content.length > 200 
      ? note.content.substring(0, 200) + '...' 
      : note.content;
  }

  async findByTags(tags: string[], options: any = {}): Promise<{ data: INote[]; total: number }> {
    const filter = { ...options.filter, tags: { $in: tags } };
    return await this.findAll({ ...options, filter });
  }
}