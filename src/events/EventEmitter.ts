import { EventEmitter as NodeEventEmitter } from 'events';

export interface IEventData {
  [key: string]: any;
}

export interface IEventHandler {
  (data: IEventData): Promise<void> | void;
}

class ApplicationEventEmitter extends NodeEventEmitter {
  // User events
  onUserRegistered(handler: IEventHandler): void {
    this.on('user:registered', handler);
  }

  onUserLoggedIn(handler: IEventHandler): void {
    this.on('user:logged_in', handler);
  }

  onUserProfileUpdated(handler: IEventHandler): void {
    this.on('user:profile_updated', handler);
  }

  // Content events
  onNoteCreated(handler: IEventHandler): void {
    this.on('note:created', handler);
  }

  onNoteViewed(handler: IEventHandler): void {
    this.on('note:viewed', handler);
  }

  onNoteDownloaded(handler: IEventHandler): void {
    this.on('note:downloaded', handler);
  }

  onAssignmentCreated(handler: IEventHandler): void {
    this.on('assignment:created', handler);
  }

  onAssignmentDue(handler: IEventHandler): void {
    this.on('assignment:due', handler);
  }

  onResourceCreated(handler: IEventHandler): void {
    this.on('resource:created', handler);
  }

  onResourceDownloaded(handler: IEventHandler): void {
    this.on('resource:downloaded', handler);
  }

  // Emit methods
  emitUserRegistered(data: IEventData): void {
    this.emit('user:registered', data);
  }

  emitUserLoggedIn(data: IEventData): void {
    this.emit('user:logged_in', data);
  }

  emitUserProfileUpdated(data: IEventData): void {
    this.emit('user:profile_updated', data);
  }

  emitNoteCreated(data: IEventData): void {
    this.emit('note:created', data);
  }

  emitNoteViewed(data: IEventData): void {
    this.emit('note:viewed', data);
  }

  emitNoteDownloaded(data: IEventData): void {
    this.emit('note:downloaded', data);
  }

  emitAssignmentCreated(data: IEventData): void {
    this.emit('assignment:created', data);
  }

  emitAssignmentDue(data: IEventData): void {
    this.emit('assignment:due', data);
  }

  emitResourceCreated(data: IEventData): void {
    this.emit('resource:created', data);
  }

  emitResourceDownloaded(data: IEventData): void {
    this.emit('resource:downloaded', data);
  }
}

export const eventEmitter = new ApplicationEventEmitter();