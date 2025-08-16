import { EventEmitter as NodeEventEmitter } from 'events';
export interface IEventData {
    [key: string]: any;
}
export interface IEventHandler {
    (data: IEventData): Promise<void> | void;
}
declare class ApplicationEventEmitter extends NodeEventEmitter {
    onUserRegistered(handler: IEventHandler): void;
    onUserLoggedIn(handler: IEventHandler): void;
    onUserProfileUpdated(handler: IEventHandler): void;
    onNoteCreated(handler: IEventHandler): void;
    onNoteViewed(handler: IEventHandler): void;
    onNoteDownloaded(handler: IEventHandler): void;
    onAssignmentCreated(handler: IEventHandler): void;
    onAssignmentDue(handler: IEventHandler): void;
    onResourceCreated(handler: IEventHandler): void;
    onResourceDownloaded(handler: IEventHandler): void;
    emitUserRegistered(data: IEventData): void;
    emitUserLoggedIn(data: IEventData): void;
    emitUserProfileUpdated(data: IEventData): void;
    emitNoteCreated(data: IEventData): void;
    emitNoteViewed(data: IEventData): void;
    emitNoteDownloaded(data: IEventData): void;
    emitAssignmentCreated(data: IEventData): void;
    emitAssignmentDue(data: IEventData): void;
    emitResourceCreated(data: IEventData): void;
    emitResourceDownloaded(data: IEventData): void;
}
export declare const eventEmitter: ApplicationEventEmitter;
export {};
//# sourceMappingURL=EventEmitter.d.ts.map