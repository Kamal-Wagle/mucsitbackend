export interface IBaseService<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: any): Promise<{ data: T[]; total: number }>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserService extends IBaseService<any> {
  findByEmail(email: string): Promise<any | null>;
  findByCredentials(email: string, password: string): Promise<any | null>;
  updatePassword(id: string, newPassword: string): Promise<boolean>;
}

export interface IContentService extends IBaseService<any> {
  findByAuthor(authorId: string, options?: any): Promise<{ data: any[]; total: number }>;
  incrementViews(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
  search(query: string, options?: any): Promise<{ data: any[]; total: number }>;
}